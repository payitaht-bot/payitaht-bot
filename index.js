const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, PermissionsBitField } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Payitaht Destek Sistemi Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// --- AYARLAR: SADECE SİLİNECEK WAITLIST ROL IDLERI ---
const WAITLIST_ROLES = 
    'nethpot': '1484133633399853178',
    'axe': '1484133827931541544',
    'sword': '1484133760613093399',
    'uhc': '1484133820440514651',
    'smp': '1482333904869396481',
    'crystal': '1484133834562863124',
    'mace': '1484133831081463889'
};

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} Giriş Yaptı!`);
});

// --- MENÜ KURULUMU ---
client.on(Events.MessageCreate, async message => {
    if (message.content === '!destek-kur' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ PAYİTAHT TİERLİST | TEST BAŞVURU')
            .setDescription('Test olmak istediğiniz kitleri aşağıdan seçebilirsiniz.\n\n🗑️ **Waitlistten Çıkmak İçin:** En alttaki temizleme butonunu kullanın.')
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
            new ButtonBuilder().setCustomId('role_clear_waitlists').setLabel('Waitlistleri Temizle').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );

        await message.channel.send({ embeds: [embed], components: [row1, row2, row3] });
    }
});

// --- ETKİLEŞİMLER ---
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const customId = interaction.customId;
    const tumWaitlistIDleri = Object.values(WAITLIST_ROLES);

    try {
        // --- SADECE WAITLIST ROLLERİNİ SİLER ---
        if (customId === 'role_clear_waitlists') {
            // Sadece yukarıda ID'si verilen rolleri hedef alır
            await member.roles.remove(tumWaitlistIDleri).catch(() => {});
            return await interaction.editReply({ content: '✅ Üzerindeki tüm bekleme listesi (Waitlist) rolleri temizlendi. Diğer rollerine dokunulmadı.' });
        }

        // --- KİT ROLÜ VERME ---
        const kit = customId.replace('role_', '');
        const targetRoleId = WAITLIST_ROLES[kit];

        if (member.roles.cache.has(targetRoleId)) {
            return await interaction.editReply({ content: `⚠️ Zaten **${kit.toUpperCase()}** bekleme listesindesin.` });
        }

        await member.roles.add(targetRoleId);
        return await interaction.editReply({ content: `✅ **${kit.toUpperCase()} Waitlist** rolü verildi!` });

    } catch (error) {
        console.error("Hata:", error);
        return await interaction.editReply({ content: '❌ Rol işlemi başarısız. Botun yetkisi yetmiyor olabilir.' });
    }
});

client.login(process.env.TOKEN);
