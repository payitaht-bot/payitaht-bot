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
const CLIENT_ID = "1482339287717642290"; // Buraya botunun ID'sini yazmalısın

// Senin paylaştığın koddaki güncel ID'ler aktarıldı
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
    try { 
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands }); 
    } catch (e) { console.error("Komut kaydedilirken hata:", e); }
})();

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} hazır ve ID'ler yüklendi!`);
});

client.on(Events.InteractionCreate, async (i) => {
    // Kurulum Komutu (/kur-waitlist)
    if (i.isChatInputCommand() && i.commandName === 'kur-waitlist') {
        if (!i.member.permissions.has('Administrator')) return i.reply({ content: "❌ Yetkin yok!", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🛡️ PAYİTAHT TİERLİST | TEST KAYIT')
            .setDescription('Aşağıdaki butonlara tıklayarak istediğiniz kitin **Waitlist** rolünü alabilirsiniz.')
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
            new ButtonBuilder().setCustomId('role_smp').setLabel('SMP').setStyle(ButtonStyle.Primary).setEmoji('🟢')
        );

        await i.reply({ embeds: [embed], components: [row1, row2] });
    }

    // Rol Verme Buton İşlemi
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
            i.reply({ content: '❌ Rol verilemedi! Botun rolü sunucu ayarlarında en üstte olmalıdır.', ephemeral: true });
        }
    }
});

client.login(TOKEN);
