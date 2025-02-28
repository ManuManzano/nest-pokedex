import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema() 
export class Pokemon extends Document { 
    // 🔹 Esta clase representa un esquema de MongoDB gracias al decorador `@Schema()`
    // 🔹 Extiende de `Document`, lo que indica que esta entidad es un documento de MongoDB
    //    al ser manejado por Mongoose en NestJS.

    // ❌ No definimos el `id: string` porque:
    // ✅ Mongoose automáticamente añade una propiedad `_id` (de tipo ObjectId).
    // ✅ NestJS/Mongoose también crea una propiedad `id` como un **getter** de `_id.toString()`, por lo que no es necesario declararlo.

    @Prop({ 
        unique: true, // 🔹 Indica que este valor debe ser único en la base de datos.
        index: true   // 🔹 Agrega un índice en esta propiedad para mejorar búsquedas.
    })
    name: string; // 🔹 Nombre del Pokémon.

    @Prop({
        unique: true, 
        index: true
    })
    no: number; // 🔹 Número identificador del Pokémon.
}

// 🔹 Generamos el esquema de Mongoose a partir de la clase:
export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

