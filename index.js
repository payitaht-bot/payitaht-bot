const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Waitlist Rol Sistemi Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] 
});

// --- AYARLAR ---
const TOKEN = process.env.TOKEN;

// Kitler ve vereceği Rol ID'leri
const KIT_ROLLER = {
    nethpot: "1484133633399853178",
    axe: "1484133827931541544",
    sword: "1484133760613093399",
    crystal: "1484133834562863124",
    mace: "1484133831081463889",
    smp: "1484134232073699349",
    uhc: "1484133820440514651" // Yeni eklenen UHC kiti
};

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} hazır!`);
});

// Paneli kurmak için: !kur-waitlist
client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!kur-waitlist' && message.member.permissions.has('Administrator')) {
        
        const embed = new EmbedBuilder()
            .setTitle('🛡️ PAYİTAHT TİERLİST | TEST KAYIT')
            .setDescription('Test sırasına girmek istediğiniz kitin butonuna tıklayarak **Waitlist** rolü alabilirsiniz.')
            .setColor(0x5865F2);

        // İlk satır butonları
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_nethpot').setLabel('NethPot Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('🟣'),
            new ButtonBuilder().setCustomId('role_axe').setLabel('Axe Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('🪓'),
            new ButtonBuilder().setCustomId('role_sword').setLabel('Sword Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('role_uhc').setLabel('UHC Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('🍎')
        );

        // İkinci satır butonları
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_crystal').setLabel('Crystal Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('💎'),
            new ButtonBuilder().setCustomId('role_mace').setLabel('Mace Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('🔨'),
            new ButtonBuilder().setCustomId('role_smp').setLabel('SMP Sırasına Katıl').setStyle(ButtonStyle.Primary).setEmoji('🟢')
        );

        await message.channel.send({ embeds: [embed], components: [row1, row2] });
        message.delete();
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const kit = interaction.customId.replace('role_', '');
    const roleId = KIT_ROLLER[kit];

    if (!roleId) return;

    try {
        if (interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(roleId);
            return interaction.reply({ content: `✅ **${kit.toUpperCase()}** sırasından ayrıldınız (Rol alındı).`, ephemeral: true });
        } else {
            await interaction.member.roles.add(roleId);
            return interaction.reply({ content: `✅ **${kit.toUpperCase()}** sırasına katıldınız (Rol verildi)!`, ephemeral: true });
        }
    } catch (error) {
        interaction.reply({ content: '❌ Rol verilemedi! Botun yetkisini kontrol et.', ephemeral: true });
    }
});

client.login(TOKEN);
