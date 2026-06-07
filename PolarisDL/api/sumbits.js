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

            const { data, error } = await supabase
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
                .select(); 

            if (error) {
                console.error("Error en Supabase:", error.message);
                return res.status(400).json({ error: error.message });
            }

            const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
            const modToken = process.env.MOD_SECRET_TOKEN;

            if (webhookUrl) {
                const idSumbitCreado = data && data[0] ? data[0].Id_Sumbit : 'Desconocido';

                const discordPayload = {
                    username: "Polaris Récords Bot",
                    avatar_url: "https://polaris-dl.vercel.app/Recursos/Border.png",
                    embeds: [{
                        title: "Nueva petición ponganse a jalar",
                        color: 16711680, // Tu color rojo puro
                        fields: [
                            { name: "ID Récord", value: `\`#${idSumbitCreado}\``, inline: true },
                            { name: "ID Nivel", value: `${Nivel}`, inline: true },
                            { name: "ID Jugador", value: `${Player}`, inline: true },
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

                // Lo enviamos con fetch normal pero dentro de un try/catch aislado para que si Discord falla, tu web NO se caiga
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(discordPayload)
                    });
                } catch (discordErr) {
                    console.error("Error al enviar el webhook a Discord:", discordErr);
                }
            }
            // =========================================================

            return res.status(201).json(data);

        } catch (err) {
            console.error("Error del servidor:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Si mandan un método raro (PUT, DELETE)
    return res.status(405).json({ error: 'Método no permitido' });
}