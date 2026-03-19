const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, REST, Routes } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Payitaht Bot Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] 
});

// --- AYARLAR ---
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1483937817192042707"; // Botunun ID'sini buraya yapıştır
const TESTER_ROLE_ID = "1482333900230361254"; 
const TICKET_CATEGORY_ID = "1484183664785883238"; 

// - Her kitin kendi sonuç kanalı
const SONUC_KANALLARI = {
    nethpot: "SONUC_KANAL_ID", axe: "SONUC_KANAL_ID", sword: "SONUC_KANAL_ID",
    crystal: "SONUC_KANAL_ID", uhc: "SONUC_KANAL_ID", mace: "SONUC_KANAL_ID", smp: "SONUC_KANAL_ID"
};

// - Rol IDleri
const ROLLER = {
    'Tier 1': 'T1_ID', 'Tier 2': 'T2_ID', 'Tier 3': 'T3_ID', 'Tier 4': 'T4_ID', 'Tier 5': 'T5_ID',
    'nethpot': '1484133633399853178', 'axe': '1484133827931541544', 'sword': '1484133760613093399',
    'uhc': '1484133820440514651', 'smp': '1482333904869396481', 'crystal': '1484133834562863124', 'mace': '1484133831081463889'
};

const KANAL_IDLERI = {
    nethpot: "1482334148495671458", axe: "1482334168938578041", sword: "1482334155231592448",
    crystal: "1482334158243106958", uhc: "1482343424291111043", mace: "1482334165180354600", smp: "14823334161413996594"
};

let kitQueues = new Map(); let kitStatus = new Map(); let currentTests = new Map(); let testVerileri = new Map();

// --- SLASH COMMAND KAYIT ---
const commands = [{ name: 'sonuc', description: 'Test sonucunu belirler ve rol işlemlerini başlatır.' }];
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ /sonuc komutu başarıyla kaydedildi!');
    } catch (e) { console.error(e); }
})();

// --- YARDIMCI FONKSİYONLAR ---
function createKitEmbed(kitName, queueArray) {
    const status = kitStatus.get(kitName);
    const testte = currentTests.get(kitName) || { player: null, tester: null };
    const list = queueArray.length > 0 ? queueArray.map((u, i) => `**${i + 1}.** ${u.nick} (<@${u.id}>)`).join('\n') : "*Şu an bekleyen oyuncu bulunmuyor.*";
    return new EmbedBuilder()
        .setAuthor({ name: 'PAYİTAHT TİERLİST • TEST SİSTEMİ', iconURL: client.user.displayAvatarURL() })
        .setColor(status.active ? 0x2ECC71 : 0xE74C3C)
        .addFields(
            { name: '📢 DURUM:', value: `${status.active ? '🟢  KAYITLAR AÇIK' : '🔴  KAYITLAR KAPALI'}`, inline: true },
            { name: '👥 BEKLEYEN:', value: `\`${queueArray.length}/20\` oyuncu`, inline: true },
            { name: '\u200B', value: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬' },
            { name: '┃ Liste', value: list },
            { name: '\u200B', value: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬' },
            { name: '👤 Testteki Oyuncu', value: testte.player ? `<@${testte.player}>` : '`Yok`', inline: true },
            { name: '🛡️ Görevli Tester', value: testte.tester ? `<@${testte.tester}>` : '`Kimse yok`', inline: true }
        ).setFooter({ text: `Payitaht Tierlist • Kit: ${kitName.toUpperCase()}` });
}

function createKitButtons(kitName) {
    const status = kitStatus.get(kitName);
    return [
        new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`join_${kitName}`).setLabel('Sıraya Katıl').setStyle(ButtonStyle.Success).setEmoji('📝'), new ButtonBuilder().setCustomId(`leave_${kitName}`).setLabel('Ayrıl').setStyle(ButtonStyle.Danger)),
        new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`next_${kitName}`).setLabel('Sırayı Başlat').setStyle(ButtonStyle.Primary).setEmoji('⚔️'), new ButtonBuilder().setCustomId(`toggle_${kitName}`).setLabel('Durdur/Aç').setStyle(ButtonStyle.Secondary))
    ];
}

client.once(Events.ClientReady, () => {
    Object.keys(KANAL_IDLERI).forEach(kit => { kitQueues.set(kit, []); kitStatus.set(kit, { active: true }); currentTests.set(kit, { player: null, tester: null }); });
    console.log("🚀 Payitaht Botu Hazır!");
});

client.on(Events.InteractionCreate, async i => {
    // --- 1. /SONUC KOMUTU ---
    if (i.isChatInputCommand() && i.commandName === 'sonuc') {
        if (!i.member.roles.cache.has(TESTER_ROLE_ID)) return i.reply({ content: "❌ Tester değilsin!", ephemeral: true });
        const kitName = Object.keys(KANAL_IDLERI).find(k => i.channel.name.includes(k));
        if (!kitName) return i.reply({ content: "❌ Bu komut sadece test kanallarında çalışır!", ephemeral: true });
        
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`win_${kitName}`).setLabel('KAZANDI').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`lose_${kitName}`).setLabel('KAYBETTİ').setStyle(ButtonStyle.Danger));
        return await i.reply({ content: "🏆 **Test sonucu nedir?**", components: [row] });
    }

    const [action, kitName] = i.customId?.split('_') || [];
    const queue = kitQueues.get(kitName);

    try {
        // --- 2. SONUÇ VE ROL AKIŞI ---
        if (action === 'win' || action === 'lose') {
            testVerileri.set(i.channel.id, { result: action === 'win' ? 'KAZANDI' : 'KAYBETTİ' });
            const select = new StringSelectMenuBuilder().setCustomId(`eski_${kitName}`).setPlaceholder('ESKİ Tier Seçin...')
                .addOptions([{ label: 'Tier 1', value: 'Tier 1' }, { label: 'Tier 2', value: 'Tier 2' }, { label: 'Tier 3', value: 'Tier 3' }, { label: 'Tier 4', value: 'Tier 4' }, { label: 'Tier 5', value: 'Tier 5' }, { label: 'Waitlist', value: kitName }]);
            return await i.update({ content: "📤 **Eski rolünü seçin:**", components: [new ActionRowBuilder().addComponents(select)] });
        }

        if (action === 'eski') {
            const data = testVerileri.get(i.channel.id);
            data.oldTier = i.values[0];
            const select = new StringSelectMenuBuilder().setCustomId(`yeni_${kitName}`).setPlaceholder('YENİ Tier Seçin...')
                .addOptions([{ label: 'Tier 1', value: 'Tier 1' }, { label: 'Tier 2', value: 'Tier 2' }, { label: 'Tier 3', value: 'Tier 3' }, { label: 'Tier 4', value: 'Tier 4' }, { label: 'Tier 5', value: 'Tier 5' }, { label: 'No Tier', value: 'No Tier' }]);
            return await i.update({ content: "📥 **Yeni verilecek tieri seçin:**", components: [new ActionRowBuilder().addComponents(select)] });
        }

        if (action === 'yeni') {
            const data = testVerileri.get(i.channel.id);
            const newTier = i.values[0];
            const oyuncu = queue[0];
            const member = await i.guild.members.fetch(oyuncu.id).catch(() => null);

            // ROL DEĞİŞİMİ
            if (member) {
                const oldRolId = ROLLER[data.oldTier];
                if (oldRolId) await member.roles.remove(oldRolId).catch(() => {});
                const newRolId = ROLLER[newTier];
                if (newRolId) await member.roles.add(newRolId).catch(() => {});
            }

            // LOG GÖNDERME
            const logKanal = await i.guild.channels.fetch(SONUC_KANALLARI[kitName]).catch(() => null);
            if (logKanal) {
                await logKanal.send({ embeds: [new EmbedBuilder().setTitle('⚔️ TEST SONUÇLANDI').setColor(0x3498DB).addFields({ name: 'Oyuncu', value: `<@${oyuncu.id}>`, inline: true }, { name: 'Sonuç', value: data.result, inline: true }, { name: 'Eski Tier', value: data.oldTier, inline: true }, { name: 'Yeni Tier', value: newTier, inline: true }, { name: 'Tester', value: `<@${i.user.id}>`, inline: true })] });
            }

            // SIRAYI KAYDIR VE ANA MESAJI GÜNCELLE
            queue.shift();
            currentTests.set(kitName, { player: null, tester: null });
            const kitKanal = await i.guild.channels.fetch(KANAL_IDLERI[kitName]);
            if (kitKanal) {
                const messages = await kitKanal.messages.fetch({ limit: 10 });
                const targetMsg = messages.find(m => m.embeds[0]?.footer?.text.includes(kitName.toUpperCase()));
                if (targetMsg) await targetMsg.edit({ embeds: [createKitEmbed(kitName, queue)], components: createKitButtons(kitName) });
            }

            // OTOMATİK SONRAKİ TICKET
            if (queue.length > 0) {
                const nextUser = queue[0];
                const nextTicket = await i.guild.channels.create({
                    name: `test-${nextUser.id}`, type: ChannelType.GuildText, parent: TICKET_CATEGORY_ID,
                    permissionOverwrites: [{ id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: nextUser.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, { id: TESTER_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }]
                });
                currentTests.set(kitName, { player: nextUser.id, tester: i.user.id });
                await nextTicket.send({ content: `<@${nextUser.id}> | Sıradaki test başladı! Bitirmek için \`/sonuc\` yazın.` });
            }

            await i.followUp({ content: "✅ Başarıyla sonuçlandırıldı!", ephemeral: true });
            return i.channel.delete().catch(() => {});
        }

        // --- 3. SIRALAMA BUTONLARI ---
        if (i.isButton()) {
            if (action === 'join') {
                if (queue.some(u => u.id === i.user.id)) return i.reply({ content: "❌ Zaten sıradasınız!", ephemeral: true });
                const modal = new ModalBuilder().setCustomId(`modal_${kitName}`).setTitle(`${kitName.toUpperCase()} Başvuru`);
                modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('n').setLabel("Nick:").setStyle(TextInputStyle.Short).setRequired(true)), new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s').setLabel("Sunucu:").setStyle(TextInputStyle.Short).setRequired(true)));
                return await i.showModal(modal);
            }
            if (action === 'next' && i.member.roles.cache.has(TESTER_ROLE_ID)) {
                await i.deferUpdate();
                const user = queue[0]; if (!user) return;
                currentTests.set(kitName, { player: user.id, tester: i.user.id });
                const ticket = await i.guild.channels.create({
                    name: `test-${user.id}`, type: ChannelType.GuildText, parent: TICKET_CATEGORY_ID,
                    permissionOverwrites: [{ id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, { id: TESTER_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }]
                });
                await ticket.send({ content: `<@${user.id}> | Test başladı! Bitirmek için \`/sonuc\` yazınız.` });
                return await i.editReply({ embeds: [createKitEmbed(kitName, queue)], components: createKitButtons(kitName) });
            }
            if (action === 'leave') { await i.deferUpdate(); const idx = queue.findIndex(u => u.id === i.user.id); if (idx !== -1) queue.splice(idx, 1); return await i.editReply({ embeds: [createKitEmbed(kitName, queue)], components: createKitButtons(kitName) }); }
            if (action === 'toggle' && i.member.roles.cache.has(TESTER_ROLE_ID)) { await i.deferUpdate(); kitStatus.get(kitName).active = !kitStatus.get(kitName).active; return await i.editReply({ embeds: [createKitEmbed(kitName, queue)], components: createKitButtons(kitName) }); }
        }
        if (i.isModalSubmit()) { await i.deferUpdate(); queue.push({ id: i.user.id, nick: i.fields.getTextInputValue('n'), server: i.fields.getTextInputValue('s') }); return await i.editReply({ embeds: [createKitEmbed(kitName, queue)], components: createKitButtons(kitName) }); }
    } catch (e) { console.error(e); }
});

client.login(TOKEN);
                
