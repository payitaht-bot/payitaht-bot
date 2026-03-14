const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✅ Bot giriş yaptı: ${client.user.tag}`);
});

// Menüyü Kurma Komutu (!kur)
client.on('messageCreate', async message => {
    if (message.content === '!kur' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle('Destek Sistemi')
            .setDescription('Test etmek için bir kit seçin...');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_sec')
                    .setPlaceholder('Test etmek için bir kit seçin...')
                    .addOptions([
                        { label: 'nethpot', description: 'Nethpot kitinde test olmak için tıkla', value: 'nethpot' },
                        { label: 'axe', description: 'Axe kitinde test olmak için tıkla', value: 'axe' },
                        { label: 'sword', description: 'Sword kitinde test olmak için tıkla', value: 'sword' },
                        { label: 'diapot', description: 'Diapot kitinde test olmak için tıkla', value: 'diapot' },
                        { label: 'uhc', description: 'UHC kitinde test olmak için tıkla', value: 'uhc' },
                        { label: 'SMP', description: 'UHC kitinde test olmak için tıkla', value: 'smp' },
                        { label: 'CRYSTAL', description: 'UHC kitinde test olmak için tıkla', value: 'crystal' },
                        { label: 'MACE', description: 'UHC kitinde test olmak için tıkla', value: 'mace' },
                    ]),
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// Seçim Yapıldığında Kanal Açma ve Rol Atama
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'ticket_sec') {
        const secilen = interaction.values[0];
        
        // --- BURASI DÜZELTİLDİ (Virgüller eklendi) ---
        const rolAyarlari = {
            'nethpot': '1482333901157568563',
            'axe': '1482346288967323688',
            'sword': '1482333903934193755',
            'diapot': '1482358050026426378',
            'uhc': '1482333902734491792',
            'smp': '1482333904869396481',
            'crystal': '1482333907952205997',
            'mace': '1482333910711926896'
        };

        const hedefRolID = rolAyarlari[secilen];

        // Kanal oluştur
        const kanal = await interaction.guild.channels.create({
            name: `${secilen}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: hedefRolID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        await interaction.reply({ content: `✅ **${secilen}** için kanalın açıldı: ${kanal}`, ephemeral: true });
        await kanal.send(`Merhaba ${interaction.user}, <@&${hedefRolID}> ekibi seninle ilgilenecek!`);
    }
});

client.login(process.env.TOKEN); // Buraya tokenını yapıştırmayı unutma!