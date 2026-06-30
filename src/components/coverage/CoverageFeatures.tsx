'use client';

import { motion } from 'framer-motion';
import {
    Clock3,
    Building2,
    Truck,
    Globe2
} from 'lucide-react';

const features = [

{
icon:Clock3,
title:"Atención inmediata",
description:"Disponibles las 24 horas del día."
},

{
icon:Building2,
title:"110+ sedes",
description:"Cobertura nacional propia."
},

{
icon:Truck,
title:"70+ vehículos",
description:"Traslados especializados."
},

{
icon:Globe2,
title:"14 departamentos",
description:"Presencia en gran parte del país."
}

];

export default function CoverageFeatures(){

return(

<section className="mt-12">

<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

{

features.map((item,index)=>{

const Icon=item.icon;

return(

<motion.div

key={item.title}

initial={{
opacity:0,
y:25
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:index*.12
}}

className="
glass
rounded-3xl
border
border-primary/10
p-7
hover:-translate-y-2
transition-all
duration-500
"

>

<div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">

<Icon className="text-primary"/>

</div>

<h3 className="font-display text-xl mb-2">

{item.title}

</h3>

<p className="text-textLight">

{item.description}

</p>

</motion.div>

)

})

}

</div>

</section>

)

}