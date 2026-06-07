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

            return res.status(201).json(data);

        } catch (err) {
            console.error("Error del servidor:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Si mandan un método raro (PUT, DELETE)
    return res.status(405).json({ error: 'Método no permitido' });
}


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { Nivel, Player, Link_Mostrar, Link_Raw, Status } = req.body;

        const { data, error: supabaseError } = await supabase
            .from('submits') // <- Pon aquí el nombre real de tu tabla de récords
            .insert([
                {
                    Nivel: Nivel,                 // ID del nivel
                    Player: Player,               // ID del jugador
                    Link_Mostrar: Link_Mostrar,
                    Link_Raw: Link_Raw,
                    Status: Status || 'P'
                }
            ]);

        if (supabaseError) {
            throw new Error(`Error en Supabase: ${supabaseError.message}`);
        }

        // 3. Sistema del Webhook secreto de Discord
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (webhookUrl) {
            const discordPayload = {
                username: "Polaris Récords Bot",
                avatar_url: "https://polaris-dl.vercel.app/Recursos/Border.png",
                embeds: [{
                    title: "📥 ¡NUEVO RÉCORD PENDIENTE DE REVISIÓN!",
                    color: 16753920, 
                    fields: [
                        { name: "🆔 ID Nivel", value: `${Nivel}`, inline: true },
                        { name: "🆔 ID Jugador", value: `${Player}`, inline: true },
                        { name: "🚦 Estado Inicial", value: `\`${Status || 'P'}\` (Pendiente)`, inline: true },
                        { name: "🔗 Link para Mostrar", value: Link_Mostrar },
                        { name: "📁 Link Raw (Prueba)", value: Link_Raw }
                    ],
                    footer: { text: "Polaris Demon List - Panel de Moderación" },
                    timestamp: new Date()
                }]
            };

 
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error crítico en endpoint de sumbits:", error);
        return res.status(500).json({ error: error.message });
    }
}