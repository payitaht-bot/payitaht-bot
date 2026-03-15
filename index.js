const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Bot 7/24 Aktif!');
});

app.listen(port, () => {
  console.log(`Bot http://localhost:${port} adresinde dinleniyor.`);
});

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ChannelType, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

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
    // Menü, Buton ve Form (Modal) etkileşimlerini dinle
 if (interaction.user.bot) return; // Sadece botları engelle, gerisi geçsin.

    // --- 1. TİCKET KAPATMA BUTONU ---
    if (interaction.isButton() && interaction.customId === 'ticket_kapat') {
        await interaction.reply('**Ticket kapatılıyor...** Kanal 5 saniye içinde silinecek. 🔒');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
    }

    // --- 2. SEÇİM MENÜSÜ (FORMU AÇAR) ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_sec') {
        const secilen = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${secilen}`)
            .setTitle('Payitaht Tierlist | Test Başvuru Formu');

        const isimInput = new TextInputBuilder()
            .setCustomId('kullanici_adi')
            .setLabel("Minecraft Kullanıcı Adı")
            .setPlaceholder("Minecraft kullanıcı adını gir")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const sunucuInput = new TextInputBuilder()
            .setCustomId('test_sunucusu')
            .setLabel("Test Sunucusu")
            .setPlaceholder("Örn: trpvp.club")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(isimInput),
            new ActionRowBuilder().addComponents(sunucuInput)
        );

        await interaction.showModal(modal);
    }

    // --- 3. FORM GÖNDERİLDİĞİNDE (KANAL AÇAR) ---
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
        const secilen = interaction.customId.replace('ticket_modal_', '');
        const mcIsim = interaction.fields.getTextInputValue('kullanici_adi');
        const sunucuIsim = interaction.fields.getTextInputValue('test_sunucusu');

        const rolAyarlari = {
            'nethpot': '1482333901157568563', 'axe': '1482346288967323688',
            'sword': '1482333903934193755', 'diapot': '1482358050026426378',
            'uhc': '1482333902734491792', 'smp': '1482333904869396481',
            'crystal': '1482333907952205997', 'mace': '1482333910711926896'
        };

        const hedefRolID = rolAyarlari[secilen];

        const kanal = await interaction.guild.channels.create({
            name: `${secilen}-${interaction.user.username}`,
            type: 0,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: hedefRolID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const kapatRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Ticketi Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await interaction.reply({ content: `✅ Kanalın açıldı: ${kanal}`, ephemeral: true });

        await kanal.send({
            content: `Merhaba ${interaction.user}, <@&${hedefRolID}> ekibi seninle ilgilenecek!\n\n**BAŞVURU BİLGİLERİ:**\n> **Minecraft Adı:** ${mcIsim}\n> **Sunucu:** ${sunucuIsim}`,
            components: [kapatRow]
        });
    }
});

client.login(process.env.TOKEN);
