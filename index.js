const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Payitaht Waitlist Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ] 
});

// --- AYARLAR ---
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "BOT_ID_BURAYA"; // Botun ID'sini buraya yapıştır

const KIT_ROLLER = {
    nethpot: "1484133633399853178",
    axe: "1484133827931541544",
    sword: "1484133760613093399",
    crystal: "1484133834562863124",
    mace: "1484133831081463889",
    smp: "1484134232073699349",
    uhc: "1484133820440514651"
};

// --- SLASH KOMUT KAYDI ---
const commands = [{
    name: 'kur-waitlist',
    description: 'Waitlist rol verme panelini kurar.'
}];

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try { await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands }); } catch (e) { console.error(e); }
})();

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} hazır! Temizleme sistemi eklendi.`);
});

client.on(Events.InteractionCreate, async (i) => {
    // Kurulum Komutu
    if (i.isChatInputCommand() && i.commandName === 'kur-waitlist') {
        if (!i.member.permissions.has('Administrator')) return i.reply({ content: "❌ Yetkin yok!", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🛡️ PAYİTAHT TİERLİST | TEST KAYIT')
            .setDescription('Test sırasına girmek için kit butonlarına, tüm sıralardan çıkmak için kırmızı butona tıklayınız.')
            .setColor(0x5865F2);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_nethpot').setLabel('NethPot').setStyle(ButtonStyle.Primary).setEmoji('🟣'),
            new ButtonBuilder().setCustomId('role_axe').setLabel('Axe').setStyle(ButtonStyle.Primary).setEmoji('🪓'),
            new ButtonBuilder().setCustomId('role_sword').setLabel('Sword').setStyle(ButtonStyle.Primary).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('role_uhc').setLabel('UHC').setStyle(ButtonStyle.Primary).setEmoji('🍎')
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_crystal').setLabel('Crystal').setStyle(ButtonStyle.Primary).setEmoji('💎'),
            new ButtonBuilder().setCustomId('role_mace').setLabel('Mace').setStyle(ButtonStyle.Primary).setEmoji('🔨'),
            new ButtonBuilder().setCustomId('role_smp').setLabel('SMP').setStyle(ButtonStyle.Primary).setEmoji('🟢'),
            // KIRMIZI TEMİZLEME BUTONU
            new ButtonBuilder().setCustomId('clear_all_waitlist').setLabel('Sıraları Temizle').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );

        await i.reply({ embeds: [embed], components: [row1, row2] });
    }

    // Tekli Rol Verme İşlemi
    if (i.isButton() && i.customId.startsWith('role_')) {
        const kit = i.customId.replace('role_', '');
        const roleId = KIT_ROLLER[kit];

        try {
            if (i.member.roles.cache.has(roleId)) {
                await i.member.roles.remove(roleId);
                return i.reply({ content: `✅ **${kit.toUpperCase()}** sırasından ayrıldınız.`, ephemeral: true });
            } else {
                await i.member.roles.add(roleId);
                return i.reply({ content: `✅ **${kit.toUpperCase()}** sırasına katıldınız!`, ephemeral: true });
            }
        } catch (error) {
            i.reply({ content: '❌ Rol hatası! Bot yetkisini kontrol et.', ephemeral: true });
        }
    }

    // TÜM ROLLERİ TEMİZLEME İŞLEMİ
    if (i.isButton() && i.customId === 'clear_all_waitlist') {
        const roller = Object.values(KIT_ROLLER); // Sadece yukarıdaki kit ID'lerini alır
        
        try {
            await i.member.roles.remove(roller);
            return i.reply({ content: '🗑️ Tüm test sıralarından başarıyla ayrıldınız ve rolleriniz temizlendi.', ephemeral: true });
        } catch (error) {
            console.error(error);
            i.reply({ content: '❌ Roller temizlenirken bir hata oluştu!', ephemeral: true });
        }
    }
});

client.login(TOKEN);
