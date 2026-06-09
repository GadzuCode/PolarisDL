export default async function handler(req, res) {
    // Supabase siempre te va a mandar un POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { event, record } = req.body;

       
        if (event !== 'INSERT') {
            return res.status(200).json({ message: 'Evento ignorado' });
        }

        const { ID_Level, Nombre_Nivel, Creator, Top } = record;

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL; 

        if (webhookUrl) {
            const discordPayload = {
                username: "Polaris List Bot",
                avatar_url: "https://polaris-dl.vercel.app/Recursos/Border.png", 
                embeds: [{
                    title: "Nuevo Nivel En La Polarianos Demon List",
                    color: 16753920,
                    fields: [
                        { name: "Nombre del Nivel", value: `**${Nombre_Nivel}**`, inline: true },
                        { name: "Creador / Host", value: `${Creator || 'Desconocido'}`, inline: true },
                        { name: "Puesto en el Top", value: `**#${Top || 'Sin colocar'}**`, inline: true },
                        { name: "ID del Nivel", value: `\`${ID_Level}\``, inline: false }
                    ],
                    footer: { text: "Polaris Demon List Updates" },
                    timestamp: new Date()
                }]
            };

            // Enviamos el aviso directo a Discord
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            });
        }

        return res.status(200).json({ success: true, message: 'Anuncio de nivel enviado a Discord' });

    } catch (err) {
        console.error("Error en el webhook de nuevo nivel:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}