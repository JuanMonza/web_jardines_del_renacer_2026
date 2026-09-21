"use client";

import { useEffect,useState,type ReactNode } from "react";
import { BriefcaseBusiness,CheckCircle2,Eye,EyeOff,LockKeyhole,Mail,Search,UserCheck,UserPlus,X } from "lucide-react";
import ScreenDialog from "@/components/ui/ScreenDialog";
import { VACANCY_DEPARTMENTS,getVacancyCitiesByDepartment } from "@/config/vacancies";
import { ACADEMIC_LEVEL_OPTIONS } from "@/config/candidates";

type Vacancy={id:string;title:string;city?:string;status?:string};
type Candidate={id:string;nombres:string;apellidos:string;documento:string;email:string;telefono?:string;ciudad?:string;departamento?:string;profesion?:string;educacion?:string;cv_url?:string;vacantes?:string|null;createdFromDashboard?:number};
type Fields={firstName:string;lastName:string;documentNumber:string;email:string;phone:string;department:string;city:string;education:string;professionalTitle:string;password:string;passwordConfirmation:string;vacancyId:string};
type Notice={tone:"success"|"error";text:string};
const emptyFields:Fields={firstName:"",lastName:"",documentNumber:"",email:"",phone:"",department:"",city:"",education:"",professionalTitle:"",password:"",passwordConfirmation:"",vacancyId:""};

export default function InternalCandidate(){
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[loadingVacancies,setLoadingVacancies]=useState(false),[showPassword,setShowPassword]=useState(false);
  const [mode,setMode]=useState<"new"|"reuse">("new"),[fields,setFields]=useState<Fields>(emptyFields),[vacancies,setVacancies]=useState<Vacancy[]>([]),[professions,setProfessions]=useState<string[]>([]),[notice,setNotice]=useState<Notice|null>(null);
  const [candidateSearch,setCandidateSearch]=useState(""),[searching,setSearching]=useState(false),[candidates,setCandidates]=useState<Candidate[]>([]),[selectedCandidateId,setSelectedCandidateId]=useState(""),[reuseVacancyId,setReuseVacancyId]=useState("");
  const [editingDocumentId,setEditingDocumentId]=useState(""),[newDocumentNumber,setNewDocumentNumber]=useState(""),[adminPassword,setAdminPassword]=useState("");

  useEffect(()=>{
    if(!open||vacancies.length)return;
    setLoadingVacancies(true);
    void Promise.all([fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes?admin=1`,{cache:"no-store"}),fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/postulante-interno`,{cache:"no-store"})])
      .then(async([vacancyResponse,profileResponse])=>{
        if(!vacancyResponse.ok||!profileResponse.ok)throw new Error();
        const vacancyData=await vacancyResponse.json(),profileData=await profileResponse.json();
        setVacancies(Array.isArray(vacancyData)?vacancyData:[]);setProfessions(Array.isArray(profileData.professions)?profileData.professions:[]);
      }).catch(()=>setNotice({tone:"error",text:"No fue posible cargar las vacantes o perfiles disponibles."})).finally(()=>setLoadingVacancies(false));
  },[open,vacancies.length]);

  useEffect(()=>{
    if(!open||mode!=="reuse"||candidateSearch.trim().length<2){setCandidates([]);setSearching(false);return;}
    const controller=new AbortController(),timer=setTimeout(()=>{
      setSearching(true);
      void fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/postulante-interno?q=${encodeURIComponent(candidateSearch.trim())}`,{cache:"no-store",signal:controller.signal})
        .then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.message);setCandidates(Array.isArray(result.data)?result.data:[]);if(Array.isArray(result.professions))setProfessions(result.professions);})
        .catch(error=>{if(error instanceof Error&&error.name!=="AbortError")setNotice({tone:"error",text:error.message||"No fue posible buscar perfiles."});})
        .finally(()=>setSearching(false));
    },300);
    return()=>{clearTimeout(timer);controller.abort();};
  },[candidateSearch,mode,open]);

  const update=(key:keyof Fields,value:string)=>setFields(current=>({...current,[key]:value}));
  const availableVacancies=vacancies.filter(vacancy=>vacancy.status!=="Pausada"&&vacancy.status!=="Cerrada");

  async function save(event:React.FormEvent){
    event.preventDefault();if(busy)return;setNotice(null);
    if(fields.password!==fields.passwordConfirmation){setNotice({tone:"error",text:"Las contraseñas no coinciden."});return;}
    setBusy(true);
    try{
      const response=await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/postulante-interno`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fields)});
      const result=await response.json() as {message?:string;data?:{vacancyTitle?:string|null;welcomeEmailSent?:boolean;applicationEmailSent?:boolean}};
      if(!response.ok)throw new Error(result.message||"No fue posible guardar la cuenta.");
      const assigned=Boolean(result.data?.vacancyTitle),expectedEmails=assigned?2:1,sentEmails=Number(Boolean(result.data?.welcomeEmailSent))+Number(assigned&&result.data?.applicationEmailSent);
      setNotice({tone:"success",text:assigned?`Cuenta creada y asignada a “${result.data?.vacancyTitle}”. ${sentEmails===expectedEmails?"Se enviaron la bienvenida, el usuario de acceso y la confirmación de postulación.":"La cuenta quedó guardada; hay correos pendientes por configuración SMTP."}`:`Cuenta creada correctamente. ${sentEmails===expectedEmails?"Se enviaron la bienvenida, el usuario y el enlace de acceso.":"El correo de acceso quedó pendiente por configuración SMTP."}`});
      setFields(emptyFields);window.dispatchEvent(new Event("candidate-application-created"));
    }catch(error){setNotice({tone:"error",text:error instanceof Error?error.message:"No fue posible guardar."});}finally{setBusy(false);}
  }

  async function reuse(event:React.FormEvent){
    event.preventDefault();if(busy)return;setNotice(null);
    if(!selectedCandidateId||!reuseVacancyId){setNotice({tone:"error",text:"Selecciona un perfil guardado y una vacante disponible."});return;}
    setBusy(true);
    try{
      const response=await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/postulante-interno`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({existingCandidateId:selectedCandidateId,vacancyId:reuseVacancyId})});
      const result=await response.json() as {message?:string;data?:{vacancyTitle?:string;applicationEmailSent?:boolean}};
      if(!response.ok)throw new Error(result.message||"No fue posible asignar el perfil.");
      setNotice({tone:"success",text:`Perfil reutilizado y asignado a “${result.data?.vacancyTitle}”. ${result.data?.applicationEmailSent?"El correo de postulación fue enviado.":"La asignación quedó guardada; el correo está pendiente por configuración SMTP."}`});
      setCandidateSearch("");setCandidates([]);setSelectedCandidateId("");setReuseVacancyId("");window.dispatchEvent(new Event("candidate-application-created"));
    }catch(error){setNotice({tone:"error",text:error instanceof Error?error.message:"No fue posible asignar el perfil."});}finally{setBusy(false);}
  }

  async function correctDocument(){
    if(!editingDocumentId||!/^\d{6,20}$/.test(newDocumentNumber)||!adminPassword||busy)return;
    setBusy(true);setNotice(null);
    try{
      const response=await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/postulante-interno/${editingDocumentId}/documento`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({documentNumber:newDocumentNumber,password:adminPassword})});
      const result=await response.json() as {message?:string;documentNumber?:string};
      if(!response.ok)throw new Error(result.message||"No fue posible corregir la cédula.");
      setCandidates(current=>current.map(candidate=>candidate.id===editingDocumentId?{...candidate,documento:result.documentNumber||newDocumentNumber}:candidate));
      setEditingDocumentId("");setNewDocumentNumber("");setAdminPassword("");
      setNotice({tone:"success",text:"Cédula corregida. El perfil y sus postulaciones conservaron su trazabilidad; la acción quedó en auditoría. Si la persona tenía una sesión abierta, deberá ingresar nuevamente."});
      window.dispatchEvent(new Event("candidate-application-created"));
    }catch(error){setNotice({tone:"error",text:error instanceof Error?error.message:"No fue posible corregir la cédula."});}
    finally{setBusy(false);}
  }

  return <>
    <button type="button" onClick={()=>{setOpen(true);setNotice(null);}} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-sm transition hover:brightness-110"><UserPlus size={18}/>Gestionar postulante</button>
    {open&&<ScreenDialog ariaLabel="Gestionar postulante interno" onClose={()=>!busy&&setOpen(false)}>
      <form onSubmit={mode==="new"?save:reuse} onClick={event=>event.stopPropagation()} className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[28px] bg-[#f7faff] shadow-2xl">
        <header className="flex items-start justify-between gap-4 rounded-t-[28px] bg-gradient-to-r from-[#173f73] to-[#4777b3] p-6 text-white"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-blue-100">Gestión de candidatos</p><h2 className="mt-2 text-2xl font-bold">{mode==="new"?"Crear cuenta de postulante":"Reutilizar perfil guardado"}</h2><p className="mt-2 max-w-xl text-sm text-blue-50">{mode==="new"?"Crea el acceso y asigna opcionalmente una vacante publicada.":"Busca una persona existente y asígnala a otra vacante sin duplicar sus datos."}</p></div><button type="button" aria-label="Cerrar" disabled={busy} onClick={()=>setOpen(false)} className="rounded-xl border border-white/20 bg-white/10 p-2.5 hover:bg-white/20 disabled:opacity-50"><X size={20}/></button></header>
        <div className="px-5 pt-5 sm:px-7"><div className="grid grid-cols-2 rounded-xl bg-blue-50 p-1"><button type="button" onClick={()=>{setMode("new");setNotice(null);}} className={`rounded-lg px-3 py-2.5 text-sm font-bold ${mode==="new"?"bg-white text-primary shadow-sm":"text-textLight"}`}><UserPlus className="mr-2 inline" size={17}/>Crear perfil</button><button type="button" onClick={()=>{setMode("reuse");setNotice(null);}} className={`rounded-lg px-3 py-2.5 text-sm font-bold ${mode==="reuse"?"bg-white text-primary shadow-sm":"text-textLight"}`}><UserCheck className="mr-2 inline" size={17}/>Usar perfil existente</button></div></div>

        {mode==="new"?<div className="space-y-6 p-5 sm:p-7">
          <section className="rounded-2xl border border-[#dbe5f3] bg-white p-5"><SectionTitle icon={<UserPlus size={20}/>} title="Datos personales" text="Los campos se validan antes de guardar."/><div className="grid gap-4 sm:grid-cols-2"><Field label="Nombres"><input required autoComplete="given-name" maxLength={80} pattern="[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '\-]+" value={fields.firstName} onChange={event=>update("firstName",event.target.value)} className="field"/></Field><Field label="Apellidos"><input required autoComplete="family-name" maxLength={80} pattern="[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '\-]+" value={fields.lastName} onChange={event=>update("lastName",event.target.value)} className="field"/></Field><Field label="Cédula"><input required inputMode="numeric" maxLength={20} pattern="[0-9]{6,20}" value={fields.documentNumber} onChange={event=>update("documentNumber",event.target.value.replace(/\D/g,""))} className="field"/></Field><Field label="Teléfono"><input required type="tel" inputMode="numeric" maxLength={20} pattern="[0-9]{7,20}" value={fields.phone} onChange={event=>update("phone",event.target.value.replace(/\D/g,""))} className="field"/></Field><Field label="Departamento"><select required value={fields.department} onChange={event=>setFields(current=>({...current,department:event.target.value,city:""}))} className="field"><option value="">Seleccionar departamento</option>{VACANCY_DEPARTMENTS.map(item=><option key={item}>{item}</option>)}</select></Field><Field label="Ciudad"><select required disabled={!fields.department} value={fields.city} onChange={event=>update("city",event.target.value)} className="field disabled:bg-slate-50"><option value="">Seleccionar ciudad</option>{getVacancyCitiesByDepartment(fields.department).map(item=><option key={item}>{item}</option>)}</select></Field></div></section>
          <section className="rounded-2xl border border-[#dbe5f3] bg-white p-5"><SectionTitle icon={<BriefcaseBusiness size={20}/>} title="Formación académica" text="Puedes reutilizar títulos o profesiones ya guardados."/><div className="grid gap-4 sm:grid-cols-2"><Field label="Nivel académico"><select required value={fields.education} onChange={event=>update("education",event.target.value)} className="field"><option value="">Seleccionar nivel</option>{ACADEMIC_LEVEL_OPTIONS.map(level=><option key={level}>{level}</option>)}</select></Field><Field label="Nombre del título o profesión"><input required list="saved-professions" maxLength={120} value={fields.professionalTitle} onChange={event=>update("professionalTitle",event.target.value)} placeholder="Escribe o selecciona una opción" className="field"/><datalist id="saved-professions">{professions.map(profession=><option key={profession} value={profession}/>)}</datalist></Field></div></section>
          <section className="rounded-2xl border border-[#dbe5f3] bg-white p-5"><SectionTitle icon={<LockKeyhole size={20}/>} title="Acceso al portal" text="La bienvenida incluirá el usuario y el enlace de acceso; la contraseña nunca se envía como texto."/><div className="grid gap-4 sm:grid-cols-2"><Field label="Correo electrónico"><div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-textLight"/><input required type="email" autoComplete="email" maxLength={120} value={fields.email} onChange={event=>update("email",event.target.value)} className="field pl-10"/></div></Field><div className="hidden sm:block"/><Field label="Contraseña"><div className="relative"><input required type={showPassword?"text":"password"} autoComplete="new-password" minLength={8} maxLength={128} value={fields.password} onChange={event=>update("password",event.target.value)} className="field pr-11"/><button type="button" aria-label={showPassword?"Ocultar contraseña":"Mostrar contraseña"} onClick={()=>setShowPassword(value=>!value)} className="absolute right-2 top-2 rounded-lg p-2 text-textLight hover:bg-slate-100">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field><Field label="Confirmar contraseña"><input required type={showPassword?"text":"password"} autoComplete="new-password" minLength={8} maxLength={128} value={fields.passwordConfirmation} onChange={event=>update("passwordConfirmation",event.target.value)} className="field"/></Field></div></section>
          <VacancySelector value={fields.vacancyId} onChange={value=>update("vacancyId",value)} vacancies={availableVacancies} loading={loadingVacancies} optional/>
          <NoticeBox notice={notice}/><Footer busy={busy} close={()=>setOpen(false)} label={fields.vacancyId?"Crear cuenta y asignar":"Crear cuenta"}/>
        </div>:<div className="space-y-5 p-5 sm:p-7">
          <section className="rounded-2xl border border-[#dbe5f3] bg-white p-5"><SectionTitle icon={<Search size={20}/>} title="Buscar perfil guardado" text="Busca por nombre, cédula, correo o profesión."/><div className="relative"><Search className="absolute left-3 top-3.5 text-textLight" size={18}/><input autoFocus value={candidateSearch} onChange={event=>{setCandidateSearch(event.target.value);setSelectedCandidateId("");}} placeholder="Empieza a escribir para buscar..." className="field pl-10"/></div><div className="mt-4 space-y-2">{searching&&<p className="py-5 text-center text-sm text-textLight">Buscando perfiles...</p>}{!searching&&candidateSearch.trim().length>=2&&!candidates.length&&<p className="rounded-xl border border-dashed p-5 text-center text-sm text-textLight">No encontramos perfiles con ese criterio.</p>}{candidates.map(candidate=><button type="button" key={candidate.id} onClick={()=>setSelectedCandidateId(candidate.id)} className={`w-full rounded-xl border p-4 text-left transition ${selectedCandidateId===candidate.id?"border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100":"border-border bg-white hover:border-blue-300"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-text">{candidate.nombres} {candidate.apellidos}</p><p className="mt-1 text-xs text-textLight">C.C. {candidate.documento} · {candidate.email}</p><p className="mt-1 text-xs font-medium text-primary">{candidate.profesion||"Profesión no registrada"} · {candidate.ciudad||"Ciudad no registrada"}</p>{candidate.vacantes&&<p className="mt-2 text-xs text-textLight">Procesos anteriores: {candidate.vacantes}</p>}</div>{selectedCandidateId===candidate.id&&<CheckCircle2 className="shrink-0 text-emerald-600" size={22}/>}</div></button>)}</div></section>
          {process.env.NEXT_PUBLIC_APP_ENV==="training"&&selectedCandidateId&&Boolean(candidates.find(candidate=>candidate.id===selectedCandidateId)?.createdFromDashboard)&&<section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <button type="button" onClick={()=>{setEditingDocumentId(selectedCandidateId);setNewDocumentNumber(candidates.find(candidate=>candidate.id===selectedCandidateId)?.documento||"");setAdminPassword("");}} className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900">Corregir cédula de este perfil</button>
            {editingDocumentId===selectedCandidateId&&<div className="mt-4 grid gap-3 sm:grid-cols-2" onKeyDown={event=>{if(event.key==="Enter")event.preventDefault();}}><Field label="Cédula corregida"><input inputMode="numeric" maxLength={20} value={newDocumentNumber} onChange={event=>setNewDocumentNumber(event.target.value.replace(/\D/g,""))} className="field"/></Field><Field label="Contraseña del administrador asignado"><input type="password" autoComplete="current-password" value={adminPassword} onChange={event=>setAdminPassword(event.target.value)} className="field"/></Field><p className="sm:col-span-2 text-xs text-amber-900">Solo se corrige la cédula de cuentas creadas aquí. La contraseña debe pertenecer al administrador que inició sesión; el cambio queda auditado.</p><div className="flex gap-2 sm:col-span-2"><button type="button" disabled={busy||!/^\d{6,20}$/.test(newDocumentNumber)||!adminPassword} onClick={()=>void correctDocument()} className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Guardar corrección</button><button type="button" onClick={()=>{setEditingDocumentId("");setAdminPassword("");}} className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold">Cancelar</button></div></div>}
          </section>}
          <VacancySelector value={reuseVacancyId} onChange={setReuseVacancyId} vacancies={availableVacancies} loading={loadingVacancies}/>
          <NoticeBox notice={notice}/><Footer busy={busy} close={()=>setOpen(false)} label="Asignar perfil a la vacante" disabled={!selectedCandidateId||!reuseVacancyId}/>
        </div>}
      </form>
    </ScreenDialog>}
    <style jsx>{`.field{width:100%;margin-top:.35rem;border:1px solid #cfdced;border-radius:.75rem;padding:.75rem .9rem;background:#fff;outline:none}.field:focus{border-color:#315d98;box-shadow:0 0 0 3px rgba(49,93,152,.12)}`}</style>
  </>;
}

function VacancySelector({value,onChange,vacancies,loading,optional=false}:{value:string;onChange:(value:string)=>void;vacancies:Vacancy[];loading:boolean;optional?:boolean}){return <section className="rounded-2xl border border-[#cbdcf1] bg-[#edf4fc] p-5"><SectionTitle icon={<BriefcaseBusiness size={20}/>} title={optional?"Asignación inicial":"Nueva vacante"} text={optional?"Es opcional. Solo se pueden asignar vacantes publicadas.":"El perfil y su hoja de vida se conservarán sin duplicar la cuenta."}/><Field label="Vacante"><select required={!optional} value={value} disabled={loading} onChange={event=>onChange(event.target.value)} className="field bg-white"><option value="">{optional?"Guardar cuenta sin asignar vacante":"Seleccionar vacante disponible"}</option>{vacancies.map(vacancy=><option key={vacancy.id} value={vacancy.id}>{vacancy.title}{vacancy.city?` · ${vacancy.city}`:""}</option>)}</select></Field></section>}
function SectionTitle({icon,title,text}:{icon:ReactNode;title:string;text:string}){return <div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-primary">{icon}</span><div><h3 className="font-bold text-text">{title}</h3><p className="text-xs text-textLight">{text}</p></div></div>}
function NoticeBox({notice}:{notice:Notice|null}){return notice?<div role="status" className={`flex gap-3 rounded-2xl border p-4 text-sm ${notice.tone==="success"?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-red-200 bg-red-50 text-red-800"}`}>{notice.tone==="success"?<CheckCircle2 className="mt-0.5 shrink-0" size={19}/>:<span className="font-bold">!</span>}<p>{notice.text}</p></div>:null}
function Footer({busy,close,label,disabled=false}:{busy:boolean;close:()=>void;label:string;disabled?:boolean}){return <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={close} className="rounded-xl border border-border bg-white px-5 py-3 font-bold text-text">Cancelar</button><button disabled={busy||disabled} className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-sm disabled:opacity-60">{busy?"Guardando...":label}</button></div>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="text-sm font-semibold text-text">{label}{children}</label>}
