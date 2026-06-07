import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    
    if (req.method === 'GET') {
        try {
            const { id_level } = req.query;

            if (!id_level) {
                return res.status(400).json({ error: 'Falta el parámetro Nivel' });
            }

            const { data, error } = await supabase
                .from('Sumbits')
                .select(`
                    Id_Sumbit,
                    Link_Mostrar,
                    Nivel,
                    Player,
                    Jugador:Player ( Nombre )
                `)
                .eq('Nivel', id_level) 
                .eq('Status', 'A');

            if (error) {
                console.error("❌ Error en Supabase:", error.message);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json(data);
            
        } catch (err) {
            console.error("❌ Error en el servidor:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }


  if (req.method === 'POST') {
        try {
            const { Nivel, Player, Link_Mostrar, Link_Raw, Status } = req.body;

            const { data: registroInsertado, error: errorInsert } = await supabase
                .from('Sumbits')
                .insert([
                    { 
                        Nivel: Nivel, 
                        Player: Player, 
                        Link_Mostrar: Link_Mostrar, 
                        Link_Raw: Link_Raw, 
                        Status: Status || 'P' 
                    }
                ])
                .select('*'); 

            if (errorInsert) {
                console.error("Error al insertar en Supabase:", errorInsert.message);
                return res.status(400).json({ error: errorInsert.message });
            }

           
            let nombreJugador = `ID: ${Player}`;
            let nombreNivel = `ID: ${Nivel}`;

            try {
                // Buscamos el nombre del Jugador
                const { data: dbJugador } = await supabase
                    .from('Player') 
                    .select('Nombre')
                    .eq('ID_plyr', Player) 
                    .single();
                if (dbJugador) nombreJugador = dbJugador.Nombre;

               
                const { data: dbNivel } = await supabase
                    .from('Niveles') 
                    .select('Nombre_Nivel') 
                    .eq('ID_Level', Nivel)   
                    .single();
                if (dbNivel) nombreNivel = dbNivel.Nombre;
            } catch (errNombres) {
                console.error("Error al traer nombres de las tablas de relación:", errNombres);
            }

            const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
            const modToken = process.env.MOD_SECRET_TOKEN;

            if (webhookUrl) {
                const idSumbitCreado = registroInsertado && registroInsertado[0] ? registroInsertado[0].Id_Sumbit : 'Desconocido';

                const discordPayload = {
                    username: "Polaris Récords Bot",
                    avatar_url: "https://polaris-dl.vercel.app/Recursos/Border.png",
                    embeds: [{
                        title: "Nueva petición ponganse a jalar",
                        color: 16711680, 
                        fields: [
                            { name: "ID Récord", value: `\`#${idSumbitCreado}\``, inline: true },
                            { name: "Nivel", value: `🎵 **${nombreNivel}**`, inline: true },
                            { name: "Jugador", value: `👤 **${nombreJugador}**`, inline: true },
                            { name: "Link para Mostrar", value: Link_Mostrar },
                            { name: "Link Raw (Prueba)", value: Link_Raw },
                            { 
                                name: "⚡ ACCIONES DE MODERACIÓN", 
                                value: `🟩 [Aceptar Récord](https://polaris-dl.vercel.app/api/moderar?action=aceptar&id=${idSumbitCreado}&token=${modToken})\n\n🟥 [Rechazar Récord](https://polaris-dl.vercel.app/api/moderar?action=rechazar&id=${idSumbitCreado}&token=${modToken})`
                            }
                        ],
                        footer: { text: "Polaris Demon List - Haz clic en una acción para procesar" },
                        timestamp: new Date()
                    }]
                };

                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(discordPayload)
                    });
                } catch (discordErr) {
                    console.error("Error al enviar a Discord:", discordErr);
                }
            }

            return res.status(201).json(registroInsertado);

        } catch (err) {
            console.error("Error del servidor:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Si mandan un método raro (PUT, DELETE)
    return res.status(405).json({ error: 'Método no permitido' });
}