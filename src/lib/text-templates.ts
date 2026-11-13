import type { InvitationKind } from './types'

/**
 * Template teks undangan per jenis undangan dan agama. Admin memilih template di formulir; yang disimpan
 * ke database adalah teksnya (bisa diedit), bukan pilihan templatenya.
 */
export type TextTemplateId =
  | 'umum'
  | 'kristen'
  | 'katolik'
  | 'islam'
  | 'anak'
  | 'anak_kristen'
  | 'anak_islam'
  | 'tujuhbelas'
  | 'dewasa'
  | 'dewasa_kristen'
  | 'dewasa_islam'
  | 'syukur'
  | 'syukur_kristen'
  | 'syukur_katolik'
  | 'syukur_islam'

export interface InvitationTexts {
  /** Kalimat pengantar di atas nama mempelai. */
  intro: string
  /** Ayat / kutipan setelah sampul; kosong = tidak ditampilkan. */
  opening: string
  /** Kalimat penutup sebelum "Kami yang berbahagia". */
  closing: string
  /** Pesan WhatsApp ke tamu; kode {tamu}, {mempelai}/{nama}, {link} diganti per tamu. */
  wa: string
}

const waBody = (p: { greeting?: string; invite: string; hope: string; farewell: string }) =>
  `${p.greeting ? `${p.greeting}\n` : ''}Kepada Yth.
Bapak/Ibu/Saudara/i *{tamu}*

${p.invite}

*{mempelai}*

Berikut link undangan kami:
{link}

${p.hope}

${p.farewell}`

/** Pesan WA ulang tahun; {nama} = nama yang berulang tahun. */
const waUltah = (p: { greeting?: string; invite: string; hope: string; farewell: string }) =>
  `${p.greeting ? `${p.greeting}\n` : ''}Kepada Yth.
Bapak/Ibu/Saudara/i *{tamu}*

${p.invite}

*{nama}*

Berikut link undangannya:
{link}

${p.hope}

${p.farewell}`

const ISLAM_OPEN = "Assalamu'alaikum Warahmatullahi Wabarakatuh."
const ISLAM_GREETING = "Assalamu'alaikum Warahmatullahi Wabarakatuh,"
const ISLAM_CLOSE = "Wassalamu'alaikum Warahmatullahi Wabarakatuh."

type Template = InvitationTexts & { label: string; kind: InvitationKind }

export const TEXT_TEMPLATES: Record<TextTemplateId, Template> = {
  umum: {
    label: 'Umum',
    kind: 'pernikahan',
    intro: 'Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan:',
    opening: '',
    closing:
      'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    wa: waBody({
      invite: 'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:',
      hope: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
      farewell: 'Terima kasih.',
    }),
  },
  kristen: {
    label: 'Kristen',
    kind: 'pernikahan',
    intro: 'Dengan sukacita dan atas kasih karunia Tuhan Yesus Kristus, kami bermaksud melangsungkan pernikahan kudus:',
    opening:
      'Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.\n— Kejadian 2:24',
    closing:
      'Merupakan suatu sukacita dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Tuhan Yesus memberkati.',
    wa: waBody({
      greeting: 'Shalom,',
      invite:
        'Dengan sukacita dan atas kasih karunia Tuhan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pemberkatan dan resepsi pernikahan kami:',
      hope: 'Merupakan sukacita bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
      farewell: 'Tuhan Yesus memberkati.',
    }),
  },
  katolik: {
    label: 'Katolik',
    kind: 'pernikahan',
    intro: 'Atas berkat dan rahmat Tuhan, kami bermaksud melangsungkan Sakramen Perkawinan:',
    opening: 'Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.\n— Markus 10:9',
    closing:
      'Merupakan suatu sukacita dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Berkah Dalem.',
    wa: waBody({
      greeting: 'Salam damai Kristus,',
      invite:
        'Atas berkat dan rahmat Tuhan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam Sakramen Perkawinan dan resepsi pernikahan kami:',
      hope: 'Merupakan sukacita bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
      farewell: 'Berkah Dalem.',
    }),
  },
  islam: {
    label: 'Islam',
    kind: 'pernikahan',
    intro:
      "Assalamu'alaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan:",
    opening:
      'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.\n— QS. Ar-Rum: 21',
    closing:
      "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Wassalamu'alaikum Warahmatullahi Wabarakatuh.",
    wa: waBody({
      greeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
      invite:
        'Dengan memohon rahmat dan ridho Allah SWT, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:',
      hope: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
      farewell: "Wassalamu'alaikum Warahmatullahi Wabarakatuh.",
    }),
  },

  // ── Ulang tahun anak ────────────────────────────────────────────────────
  anak: {
    label: 'Umum',
    kind: 'ultah_anak',
    intro: 'Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i beserta putra-putri untuk merayakan ulang tahun buah hati kami:',
    opening: '',
    closing: 'Kehadiran dan doa Bapak/Ibu/Saudara/i serta adik-adik akan membuat hari ulang tahun ini semakin istimewa. Terima kasih!',
    wa: waUltah({
      greeting: 'Halo,',
      invite: 'Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i beserta putra-putri untuk hadir di pesta ulang tahun:',
      hope: 'Kehadiran Bapak/Ibu/Saudara/i dan adik-adik akan membuat hari ini semakin meriah.',
      farewell: 'Terima kasih! 🎈',
    }),
  },
  anak_kristen: {
    label: 'Kristen / Katolik',
    kind: 'ultah_anak',
    intro: 'Dengan sukacita dan ucapan syukur kepada Tuhan atas penyertaan-Nya, kami mengundang Bapak/Ibu/Saudara/i untuk merayakan ulang tahun buah hati kami:',
    opening:
      'Biarkanlah anak-anak itu datang kepada-Ku, jangan menghalang-halangi mereka, sebab orang-orang yang seperti itulah yang empunya Kerajaan Allah.\n— Markus 10:14',
    closing: 'Kehadiran dan doa Bapak/Ibu/Saudara/i akan menjadi sukacita bagi kami. Tuhan memberkati.',
    wa: waUltah({
      greeting: 'Shalom,',
      invite: 'Dengan sukacita dan ucapan syukur kepada Tuhan, kami mengundang Bapak/Ibu/Saudara/i beserta putra-putri untuk hadir di pesta ulang tahun:',
      hope: 'Kehadiran dan doa Bapak/Ibu/Saudara/i akan menjadi sukacita bagi kami.',
      farewell: 'Tuhan memberkati. 🎈',
    }),
  },
  anak_islam: {
    label: 'Islam',
    kind: 'ultah_anak',
    intro: `${ISLAM_OPEN} Dengan rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i beserta putra-putri untuk menghadiri syukuran ulang tahun buah hati kami:`,
    opening:
      'Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.\n— QS. Al-Furqan: 74',
    closing: `Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kebahagiaan bagi kami. ${ISLAM_CLOSE}`,
    wa: waUltah({
      greeting: ISLAM_GREETING,
      invite: 'Dengan rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i beserta putra-putri untuk menghadiri syukuran ulang tahun:',
      hope: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kebahagiaan bagi kami.',
      farewell: ISLAM_CLOSE,
    }),
  },

  // ── Sweet seventeen ────────────────────────────────────────────────────
  tujuhbelas: {
    label: 'Umum',
    kind: 'sweet_seventeen',
    intro: 'Tujuh belas tahun hanya datang sekali. Dengan penuh sukacita, aku mengundangmu untuk merayakan malam spesialku:',
    opening: '',
    closing: 'Kehadiranmu akan membuat malam ini jadi kenangan yang tak terlupakan. Sampai jumpa!',
    wa: `Hai *{tamu}*! ✨

Tujuh belas tahun hanya datang sekali, dan aku ingin merayakannya bersamamu:

*Sweet Seventeen {nama}*

Ini link undangannya:
{link}

Jangan lupa konfirmasi kehadiran ya. Sampai jumpa! 💖`,
  },

  // ── Ulang tahun dewasa ─────────────────────────────────────────────────
  dewasa: {
    label: 'Umum',
    kind: 'ultah_dewasa',
    intro: 'Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk merayakan hari ulang tahun:',
    opening: '',
    closing: 'Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan berbagi sukacita bersama. Terima kasih.',
    wa: waUltah({
      invite: 'Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam perayaan ulang tahun:',
      hope: 'Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan berbagi sukacita bersama.',
      farewell: 'Terima kasih.',
    }),
  },
  dewasa_kristen: {
    label: 'Kristen / Katolik',
    kind: 'ultah_dewasa',
    intro: 'Dengan ucapan syukur kepada Tuhan atas penyertaan-Nya sepanjang tahun, kami mengundang Bapak/Ibu/Saudara/i untuk merayakan hari ulang tahun:',
    opening: 'Ajarlah kami menghitung hari-hari kami sedemikian, hingga kami beroleh hati yang bijaksana.\n— Mazmur 90:12',
    closing: 'Merupakan sukacita bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan berbagi sukacita bersama. Tuhan memberkati.',
    wa: waUltah({
      greeting: 'Shalom,',
      invite: 'Dengan ucapan syukur kepada Tuhan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam perayaan ulang tahun:',
      hope: 'Merupakan sukacita bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan berbagi sukacita bersama.',
      farewell: 'Tuhan memberkati.',
    }),
  },
  dewasa_islam: {
    label: 'Islam',
    kind: 'ultah_dewasa',
    intro: `${ISLAM_OPEN} Dengan rasa syukur kepada Allah SWT atas nikmat usia yang diberikan, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri syukuran ulang tahun:`,
    opening: '',
    closing: `Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa. ${ISLAM_CLOSE}`,
    wa: waUltah({
      greeting: ISLAM_GREETING,
      invite: 'Dengan rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri syukuran ulang tahun:',
      hope: 'Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa.',
      farewell: ISLAM_CLOSE,
    }),
  },

  // ── Syukuran usia emas ─────────────────────────────────────────────────
  syukur: {
    label: 'Umum',
    kind: 'ultah_syukur',
    intro: 'Dengan penuh rasa syukur atas anugerah usia dan kesehatan, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk hadir dalam syukuran ulang tahun:',
    opening: '',
    closing: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kehormatan dan kebahagiaan bagi kami sekeluarga. Terima kasih.',
    wa: waUltah({
      invite: 'Dengan penuh rasa syukur, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk hadir dalam syukuran ulang tahun:',
      hope: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kehormatan bagi kami sekeluarga.',
      farewell: 'Terima kasih.',
    }),
  },
  syukur_kristen: {
    label: 'Kristen',
    kind: 'ultah_syukur',
    intro: 'Dengan ucapan syukur kepada Tuhan Yesus Kristus atas kasih setia-Nya, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk hadir dalam ibadah syukur ulang tahun:',
    opening: 'Sampai masa tuamu Aku tetap Dia dan sampai masa putih rambutmu Aku menggendong kamu.\n— Yesaya 46:4',
    closing: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan sukacita bagi kami sekeluarga. Tuhan Yesus memberkati.',
    wa: waUltah({
      greeting: 'Shalom,',
      invite: 'Dengan ucapan syukur kepada Tuhan, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk hadir dalam ibadah syukur ulang tahun:',
      hope: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan sukacita bagi kami sekeluarga.',
      farewell: 'Tuhan Yesus memberkati.',
    }),
  },
  syukur_katolik: {
    label: 'Katolik',
    kind: 'ultah_syukur',
    intro: 'Atas berkat dan rahmat Tuhan, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk hadir dalam misa dan syukuran ulang tahun:',
    opening: 'Pada masa tua pun mereka masih berbuah, menjadi gemuk dan segar.\n— Mazmur 92:15',
    closing: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan sukacita bagi kami sekeluarga. Berkah Dalem.',
    wa: waUltah({
      greeting: 'Salam damai Kristus,',
      invite: 'Atas berkat dan rahmat Tuhan, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk hadir dalam misa dan syukuran ulang tahun:',
      hope: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan sukacita bagi kami sekeluarga.',
      farewell: 'Berkah Dalem.',
    }),
  },
  syukur_islam: {
    label: 'Islam',
    kind: 'ultah_syukur',
    intro: `${ISLAM_OPEN} Dengan memanjatkan puji syukur kehadirat Allah SWT atas nikmat usia dan kesehatan, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk menghadiri syukuran ulang tahun:`,
    opening: '',
    closing: `Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kehormatan bagi kami sekeluarga. ${ISLAM_CLOSE}`,
    wa: waUltah({
      greeting: ISLAM_GREETING,
      invite: 'Dengan memanjatkan puji syukur kehadirat Allah SWT, kami sekeluarga mengundang Bapak/Ibu/Saudara/i untuk menghadiri syukuran ulang tahun:',
      hope: 'Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kehormatan bagi kami sekeluarga.',
      farewell: ISLAM_CLOSE,
    }),
  },
}

/** Keempat teks sebuah template (tanpa label). */
export function templateTexts(id: TextTemplateId): InvitationTexts {
  const { intro, opening, closing, wa } = TEXT_TEMPLATES[id]
  return { intro, opening, closing, wa }
}

/** Template yang tersedia untuk sebuah jenis undangan; yang pertama adalah bawaan. */
export function templatesFor(kind: InvitationKind): TextTemplateId[] {
  return (Object.keys(TEXT_TEMPLATES) as TextTemplateId[]).filter((id) => TEXT_TEMPLATES[id].kind === kind)
}

export const defaultTemplate = (kind: InvitationKind): TextTemplateId => templatesFor(kind)[0]

/**
 * Mengganti {tamu}, {mempelai}/{nama}, {link} dalam satu kali lintasan: isi nama tidak ikut diganti lagi,
 * dan pola khusus String.replace ($&, $') di nama tidak berlaku.
 */
export function fillWaMessage(template: string, p: { guestName: string; coupleName: string; link: string }): string {
  const values: Record<string, string> = { tamu: p.guestName, mempelai: p.coupleName, nama: p.coupleName, link: p.link }
  return template.replace(/\{(tamu|mempelai|nama|link)\}/g, (_m, key: string) => values[key])
}

/** Teks yang dipakai sebuah undangan. Kolom kosong (undangan lama) memakai template Umum. */
export function effectiveTexts(inv: {
  intro_text: string | null
  opening_text: string | null
  closing_text: string | null
  wa_message: string | null
}): InvitationTexts {
  const umum = TEXT_TEMPLATES.umum
  return {
    intro: inv.intro_text ?? umum.intro,
    opening: inv.opening_text ?? '',
    closing: inv.closing_text ?? umum.closing,
    wa: inv.wa_message ?? umum.wa,
  }
}

/** Template yang keempat teksnya persis sama, atau null bila admin sudah mengedit. */
export function findTemplate(t: InvitationTexts): TextTemplateId | null {
  const hit = (Object.keys(TEXT_TEMPLATES) as TextTemplateId[]).find((id) => {
    const tpl = TEXT_TEMPLATES[id]
    return tpl.intro === t.intro && tpl.opening === t.opening && tpl.closing === t.closing && tpl.wa === t.wa
  })
  return hit ?? null
}

/** True bila keempat teks persis sama dengan salah satu template (belum diedit admin). */
export function matchesTemplate(t: InvitationTexts): boolean {
  return findTemplate(t) !== null
}
