/**
 * Template teks undangan per agama. Admin memilih template di formulir; yang disimpan ke database
 * adalah teksnya (bisa diedit), bukan pilihan templatenya.
 */
export type TextTemplateId = 'umum' | 'kristen' | 'katolik' | 'islam'

export interface InvitationTexts {
  /** Kalimat pengantar di atas nama mempelai. */
  intro: string
  /** Ayat / kutipan setelah sampul; kosong = tidak ditampilkan. */
  opening: string
  /** Kalimat penutup sebelum "Kami yang berbahagia". */
  closing: string
  /** Pesan WhatsApp ke tamu; kode {tamu}, {mempelai}, {link} diganti per tamu. */
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

export const TEXT_TEMPLATES: Record<TextTemplateId, InvitationTexts & { label: string }> = {
  umum: {
    label: 'Umum',
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
}

/** Keempat teks sebuah template (tanpa label). */
export function templateTexts(id: TextTemplateId): InvitationTexts {
  const { intro, opening, closing, wa } = TEXT_TEMPLATES[id]
  return { intro, opening, closing, wa }
}

/**
 * Mengganti {tamu}, {mempelai}, {link} dalam satu kali lintasan: isi nama tidak ikut diganti lagi,
 * dan pola khusus String.replace ($&, $') di nama tidak berlaku.
 */
export function fillWaMessage(template: string, p: { guestName: string; coupleName: string; link: string }): string {
  const values: Record<string, string> = { tamu: p.guestName, mempelai: p.coupleName, link: p.link }
  return template.replace(/\{(tamu|mempelai|link)\}/g, (_m, key: string) => values[key])
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
