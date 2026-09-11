const fs = require("fs");
const vm = require("vm");
const ts = require("typescript");
const assert = require("node:assert/strict");
let allowed = true, revision = 0, committed = false, writes = [];
const session = { name: "Administrador de prueba", userId: 17, permissions: ["vacancies.applications.update"] };
const connection = {
  beginTransaction: async () => {}, rollback: async () => {}, release: () => {},
  commit: async () => { committed = true; },
  query: async sql => sql.includes("SELECT id FROM postulaciones") ? [[{ id: 1 }]] : [[{fields_json: {observaciones:"Nota anterior"},revision}]],
  execute: async (sql,params) => { writes.push({sql,params});return [{}]; },
};
function load(path) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path,"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code, { exports, require(name) {
    if(name==="next/server")return {NextResponse:{json:(body,options={})=>({body,status:options.status||200})}};
    if(name==="@/lib/db")return {default:{getConnection:async()=>connection}};
    if(name==="@/lib/selection-followup")return {ensureSelectionSchema:async()=>{}};
    if(name==="@/config/selection-followup")return load("src/config/selection-followup.ts");
    if(name==="@/lib/iam/admin-session")return {ADMIN_SESSION_COOKIE:"test",requireAdminPermission:async()=>allowed?session:null};
    throw new Error(name);
  } });
  return exports;
}
async function run() {
  const route=load("src/app/api/vacantes/postulaciones/[id]/seguimiento/route.ts");
  const request=body=>({cookies:{get:()=>({value:"test"})},json:async()=>body});
  allowed=false;
  assert.equal((await route.PUT(request({}),{params:{id:"1"}})).status,403);
  allowed=true;
  assert.equal((await route.PUT(request({fields:{observaciones:"x".repeat(10001)},revision:0}),{params:{id:"1"}})).status,422);
  revision=2;
  assert.equal((await route.PUT(request({fields:{},revision:1}),{params:{id:"1"}})).status,409);
  assert.equal(committed,false);
  revision=0;
  const result=await route.PUT(request({fields:{observaciones:"Nota nueva"},revision:0}),{params:{id:"1"}});
  assert.equal(result.status,200);
  assert.equal(committed,true);
  const audit=writes.find(write=>write.sql.includes("activity_logs"));
  assert.ok(audit.params[1].includes("Nota anterior"));
  assert.ok(audit.params[1].includes("Nota nueva"));
  assert.ok(audit.params[1].includes("ID 17"));
  console.log("Seguimiento: permisos, límites, concurrencia y auditoría verificados.");
}
run().catch(error=>{console.error(error);process.exitCode=1;});
