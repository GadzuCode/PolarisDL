import { createClient } from '@supabase/supabase-js';

// Inicializamos Supabase una sola vez para todo el archivo
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    
    if (req.method === 'GET') {
        try {
            const { id_level } = req.query;

            if (!id_level) {
                return res.status(400).json({ error: 'Falta el parámetro Nivel' });
            }

            const { data, error } = await supabase
                .from('Sumbits') // Asegúrate de que coincida con tu tabla en Supabase
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
                console.error("❌ Error en Supabase (GET):", error.message);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json(data);
            
        } catch (err) {
            console.error("❌ Error en el servidor (GET):", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

  
    if (req.method === 'POST') {
        try {
            const { Nivel, Player, Link_Mostrar, Link_Raw, Status } = req.body;

            // 1. Insertar en la Base de Datos
            const { data, error: supabaseError } = await supabase
                .from('Sumbits') // Mismo nombre de tabla que en el GET
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

            if (supabaseError) {
                console.error("❌ Error en Supabase (POST):", supabaseError.message);
                return res.status(400).json({ error: supabaseError.message });
            }

            // 2. Sistema del Webhook secreto de Discord (¡Integrado aquí!)
            const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

            if (webhookUrl) {
                const discordPayload = {
                    username: "Polaris Récords Bot",
                    avatar_url: "https://polaris-dl.vercel.app/Recursos/Border.png",
                    embeds: [{
                        title: "📥 ¡NUEVO RÉCORD PENDIENTE DE REVISIÓN!",
                        color: 16753920, // Color naranja elegante
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

                // Enviamos la alerta a tu canal de Discord sin trancarte el proceso
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(discordPayload)
                }).catch(err => console.error("Error al enviar a Discord:", err));
            }

            // Devolvemos el estatus de éxito 201 (Creado) junto con la data ingresada
            return res.status(201).json(data);

        } catch (err) {
            console.error("❌ Error del servidor (POST):", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Si entran con un método no permitido (PUT, DELETE, etc.)
    return res.status(405).json({ error: 'Método no permitido' });
}