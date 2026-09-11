import {NextRequest,NextResponse} from "next/server";
import {ADMIN_SESSION_COOKIE,requireAdminPermission} from "@/lib/iam/admin-session";
import {hashCandidatePasswordForDB} from "@/lib/candidateAuth";
import {createApplicationInDB,createCandidateAccountInDB,getCandidateAccountByDocumentOrEmail} from "@/lib/candidateStorageDB";
import {getVacancyByIdFromDB} from "@/lib/vacanciesStorageDB";
import {sendCandidateApplicationReceivedEmail,sendCandidateWelcomeEmail} from "@/lib/candidateMailer";
import {recordVacancyAudit} from "@/lib/vacancy-audit";
import {ACADEMIC_LEVEL_OPTIONS} from "@/config/candidates";
import {query} from "@/lib/db";
function text(value:unknown){return typeof value==="string"?value.trim():"";}
function validName(value:string){return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(value);}
type ExistingCandidate={id:number;nombres:string;apellidos:string;documento:string;email:string;telefono:string;ciudad:string;departamento:string;profesion:string;educacion:string;cv_url:string;vacantes:string|null};

export async function GET(request:NextRequest){
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.view");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  const search=text(request.nextUrl.searchParams.get("q")).slice(0,120);
  try{
    const professions=await query<{profession:string}>("SELECT DISTINCT TRIM(profesion) AS profession FROM candidatos WHERE deleted_at IS NULL AND TRIM(COALESCE(profesion,''))<>'' ORDER BY profession LIMIT 100");
    if(search.length<2)return NextResponse.json({data:[],professions:professions.map(item=>item.profession)});
    const term=`%${search}%`;
    const candidates=await query<ExistingCandidate>(`SELECT c.id,c.nombres,c.apellidos,c.documento,c.email,c.telefono,c.ciudad,c.departamento,c.profesion,c.educacion,c.cv_url,
      GROUP_CONCAT(DISTINCT v.titulo ORDER BY p.created_at DESC SEPARATOR ' · ') AS vacantes
      FROM candidatos c LEFT JOIN postulaciones p ON p.candidato_id=c.id AND p.deleted_at IS NULL LEFT JOIN vacantes v ON v.id=p.vacante_id
      WHERE c.deleted_at IS NULL AND c.activo=TRUE AND (c.documento LIKE ? OR c.email LIKE ? OR CONCAT(c.nombres,' ',c.apellidos) LIKE ? OR c.profesion LIKE ?)
      GROUP BY c.id,c.nombres,c.apellidos,c.documento,c.email,c.telefono,c.ciudad,c.departamento,c.profesion,c.educacion,c.cv_url
      ORDER BY c.updated_at DESC LIMIT 20`,[term,term,term,term]);
    return NextResponse.json({data:candidates.map(candidate=>({...candidate,id:String(candidate.id)})),professions:professions.map(item=>item.profession)},{headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("Error buscando perfiles reutilizables:",error);return NextResponse.json({message:"No fue posible buscar los perfiles guardados."},{status:500});}
}
export async function POST(request:NextRequest){
  const session=await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value,"vacancies.applications.update");
  if(!session)return NextResponse.json({message:"No autorizado."},{status:403});
  try{
    const body=await request.json();
    const existingCandidateId=text(body.existingCandidateId),existingVacancyId=text(body.vacancyId);
    if(existingCandidateId){
      if(!/^\d+$/.test(existingCandidateId)||!existingVacancyId)return NextResponse.json({message:"Selecciona un perfil y una vacante disponible."},{status:422});
      const vacancy=await getVacancyByIdFromDB(existingVacancyId);
      if(!vacancy)return NextResponse.json({message:"La vacante está pausada, cerrada o ya no está disponible."},{status:409});
      const candidates=await query<ExistingCandidate>("SELECT id,nombres,apellidos,documento,email,telefono,ciudad,departamento,profesion,educacion,cv_url,NULL AS vacantes FROM candidatos WHERE id=? AND activo=TRUE AND deleted_at IS NULL LIMIT 1",[existingCandidateId]);
      const candidate=candidates[0];
      if(!candidate)return NextResponse.json({message:"El perfil seleccionado ya no está disponible."},{status:404});
      const duplicates=await query<{id:number}>("SELECT id FROM postulaciones WHERE candidato_id=? AND vacante_id=? AND deleted_at IS NULL LIMIT 1",[candidate.id,vacancy.id]);
      if(duplicates.length)return NextResponse.json({message:"Esta persona ya está registrada en la vacante seleccionada."},{status:409});
      const fullName=`${candidate.nombres} ${candidate.apellidos}`.trim();
      const applicationId=await createApplicationInDB({candidateId:String(candidate.id),vacancyId:vacancy.id,vacancyTitle:vacancy.title,candidateDocument:candidate.documento,candidateName:fullName,candidateEmail:candidate.email,candidatePhone:candidate.telefono||"",candidateCity:candidate.ciudad||"",candidateDepartment:candidate.departamento||"",candidateProfessionalTitle:candidate.profesion||"",candidateEducation:candidate.educacion||"",applicationSource:"Manual",resumeFileName:"",resumeFileData:"",resumeUrl:candidate.cv_url||""});
      await recordVacancyAudit({action:"PERFIL_REUTILIZADO_EN_VACANTE",table:"postulaciones",recordId:applicationId,description:`Administrador ${session.name} (ID ${session.userId}) reutilizó el perfil de ${fullName} (${candidate.documento}) y lo asignó a la vacante “${vacancy.title}”.`});
      let applicationEmailSent=false;
      try{applicationEmailSent=await sendCandidateApplicationReceivedEmail({email:candidate.email,name:fullName,vacancyTitle:vacancy.title,trackingCode:`JDR-${applicationId.padStart(6,"0")}`});}catch(error){console.error("No se pudo enviar el correo de nueva asignación:",error);}
      await recordVacancyAudit({action:applicationEmailSent?"REUTILIZACION_NOTIFICADA":"REUTILIZACION_CORREO_PENDIENTE",table:"postulaciones",recordId:applicationId,description:applicationEmailSent?`Se notificó a ${candidate.email} la nueva postulación en “${vacancy.title}”.`:`La nueva postulación en “${vacancy.title}” quedó guardada, pero el correo está pendiente.`});
      return NextResponse.json({success:true,data:{candidateId:String(candidate.id),applicationId,vacancyTitle:vacancy.title,applicationEmailSent,reused:true}},{status:201});
    }
    const firstName=text(body.firstName),lastName=text(body.lastName),documentNumber=text(body.documentNumber).replace(/\D/g,""),email=text(body.email).toLowerCase(),phone=text(body.phone).replace(/\D/g,""),city=text(body.city),department=text(body.department),education=text(body.education),professionalTitle=text(body.professionalTitle),password=text(body.password),vacancyId=text(body.vacancyId);
    if(!firstName||!lastName||!validName(firstName)||!validName(lastName)||!city||!department)return NextResponse.json({message:"Completa nombres, apellidos y ubicación con información válida."},{status:422});
    if(!/^\d{6,20}$/.test(documentNumber)||!/^\d{7,20}$/.test(phone)||!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({message:"Revisa la cédula, el teléfono y el correo electrónico."},{status:422});
    if(!(ACADEMIC_LEVEL_OPTIONS as readonly string[]).includes(education)||!professionalTitle||professionalTitle.length>120)return NextResponse.json({message:"Selecciona el nivel académico y escribe el nombre del título o profesión."},{status:422});
    if(password.length<8||password.length>128)return NextResponse.json({message:"La contraseña debe tener entre 8 y 128 caracteres."},{status:422});
    const vacancy=vacancyId?await getVacancyByIdFromDB(vacancyId):null;
    if(vacancyId&&!vacancy)return NextResponse.json({message:"La vacante seleccionada está pausada, cerrada o ya no está disponible."},{status:409});
    if(await getCandidateAccountByDocumentOrEmail({documentNumber,email}))return NextResponse.json({message:"Ya existe una persona con ese documento o correo."},{status:409});
    const passwordHash=await hashCandidatePasswordForDB(password);
    const id=await createCandidateAccountInDB({firstName,lastName,documentNumber,email,phone,city,department,education,professionalTitle,passwordHash});
    const fullName=`${firstName} ${lastName}`;
    await recordVacancyAudit({action:"POSTULANTE_INTERNO_CREADO",table:"candidatos",recordId:id,description:`Administrador ${session.name} (ID ${session.userId}) creó la cuenta interna de ${fullName} (${documentNumber}).`});
    let welcomeEmailSent=false,applicationEmailSent=false,applicationId="";
    try{welcomeEmailSent=await sendCandidateWelcomeEmail({email,name:fullName,loginWithPassword:true});}catch(error){console.error("No se pudo enviar el correo de bienvenida:",error);}
    if(vacancy){
      applicationId=await createApplicationInDB({candidateId:id,vacancyId:vacancy.id,vacancyTitle:vacancy.title,candidateDocument:documentNumber,candidateName:fullName,candidateEmail:email,candidatePhone:phone,candidateCity:city,candidateDepartment:department,candidateProfessionalTitle:professionalTitle,candidateEducation:education,applicationSource:"Manual",resumeFileName:"",resumeFileData:"",resumeUrl:""});
      await recordVacancyAudit({action:"POSTULANTE_INTERNO_ASIGNADO",table:"postulaciones",recordId:applicationId,description:`Administrador ${session.name} (ID ${session.userId}) asignó a ${fullName} (${documentNumber}) a la vacante “${vacancy.title}”. Estado informado: Recibida.`});
      try{applicationEmailSent=await sendCandidateApplicationReceivedEmail({email,name:fullName,vacancyTitle:vacancy.title,trackingCode:`JDR-${applicationId.padStart(6,"0")}`});}catch(error){console.error("No se pudo enviar el correo de asignación:",error);}
      await recordVacancyAudit({action:applicationEmailSent?"POSTULANTE_ACUSE_ENVIADO":"POSTULANTE_ACUSE_PENDIENTE",table:"postulaciones",recordId:applicationId,description:applicationEmailSent?`Se notificó a ${email} la asignación a “${vacancy.title}”.`:`La asignación a “${vacancy.title}” quedó guardada, pero el correo está pendiente.`});
    }
    return NextResponse.json({success:true,data:{candidateId:id,applicationId:applicationId||null,vacancyTitle:vacancy?.title||null,welcomeEmailSent,applicationEmailSent}},{status:201});
  }catch(error){console.error("Error creando postulante interno:",error);const code=(error as {code?:string})?.code;return NextResponse.json({message:code==="ER_DUP_ENTRY"?"Ya existe una persona con ese documento o correo.":"No fue posible crear el postulante."},{status:code==="ER_DUP_ENTRY"?409:500});}
}
