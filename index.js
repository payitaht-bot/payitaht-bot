const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, PermissionsBitField } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Payitaht Destek Sistemi Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// --- AYARLAR: GÜNCEL WAITLIST ROL IDLERI ---
const WAITLIST_ROLES = {
    'nethpot': '1484133633399853178',
    'axe': '1484133827931541544',
    'sword': '1484133760613093399',
    'uhc': '1484133820440514651',
    'smp': '1482333904869396481',
    'crystal': '1484133834562863124',
    'mace': '1484133831081463889'
};

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} Hazır!`);
});

// --- DESTEK MENÜSÜ KURULUMU (!destek-kur) ---
client.on(Events.MessageCreate, async message => {
    if (message.content === '!destek-kur' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ PAYİTAHT TİERLİST | TEST BAŞVURU')
            .setDescription('Test olmak istediğiniz kitleri aşağıdan seçebilirsiniz.\nİstediğiniz kadar kiti seçip bekleme listelerine katılabilirsiniz.')
            .setColor(0x2b2d31)
            .setFooter({ text: 'Payitaht Tierlist • Rol Sistemi' });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_nethpot').setLabel('Nethpot').setStyle(ButtonStyle.Primary).setEmoji('🧪'),
            new ButtonBuilder().setCustomId('role_axe').setLabel('Axe').setStyle(ButtonStyle.Primary).setEmoji('🪓'),
            new ButtonBuilder().setCustomId('role_sword').setLabel('Sword').setStyle(ButtonStyle.Primary).setEmoji('⚔️')
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_crystal').setLabel('Crystal').setStyle(ButtonStyle.Primary).setEmoji('💎'),
            new ButtonBuilder().setCustomId('role_uhc').setLabel('UHC').setStyle(ButtonStyle.Primary).setEmoji('🍎'),
            new ButtonBuilder().setCustomId('role_mace').setLabel('Mace').setStyle(ButtonStyle.Primary).setEmoji('🔨')
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_smp').setLabel('SMP').setStyle(ButtonStyle.Primary).setEmoji('🌍'),
            new ButtonBuilder().setCustomId('role_clear').setLabel('Tümünü Temizle').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );

        await message.channel.send({ embeds: [embed], components: [row1, row2, row3] });
    }
});

// --- BUTON ETKİLEŞİM YÖNETİMİ ---
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    // Hata önleyici deferReply (ephemeral: sadece kullanıcı görür)
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const customId = interaction.customId;

    try {
        // Rolleri Temizle Butonu
        if (customId === 'role_clear') {
            const allWaitlistRoles = Object.values(WAITLIST_ROLES);
            await member.roles.remove(allWaitlistRoles).catch(() => {});
            return await interaction.editReply({ content: '✅ Üzerindeki tüm waitlist rolleri temizlendi.' });
        }

        // Kit Rolü Verme (Eski roller silinmez)
        const kit = customId.replace('role_', '');
        const targetRoleId = WAITLIST_ROLES[kit];

        // Eğer oyuncuda zaten bu rol varsa bilgilendir
        if (member.roles.cache.has(targetRoleId)) {
            return await interaction.editReply({ content: `⚠️ Zaten **${kit.toUpperCase()} Waitlist** rolüne sahipsin.` });
        }

        // Rolü ver
        await member.roles.add(targetRoleId);

        return await interaction.editReply({ 
            content: `✅ **${kit.toUpperCase()} Waitlist** rolü başarıyla eklendi!` 
        });

    } catch (error) {
        console.error("Hata:", error);
        return await interaction.editReply({ content: '❌ İşlem yapılamadı. Botun yetkilerini kontrol edin!' });
    }
});

client.login(process.env.TOKEN);
