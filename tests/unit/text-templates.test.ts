import { describe, expect, it } from 'vitest'
import { waMessage } from '@/lib/links'
import { effectiveTexts, fillWaMessage, findTemplate, matchesTemplate, TEXT_TEMPLATES, templateTexts, type TextTemplateId } from '@/lib/text-templates'
import { makeInvitation } from '../fixtures/invitation'

const ids = Object.keys(TEXT_TEMPLATES) as TextTemplateId[]

describe('TEXT_TEMPLATES', () => {
  it('ada template Umum, Kristen, Katolik, Islam', () => {
    expect(ids.sort()).toEqual(['islam', 'katolik', 'kristen', 'umum'])
  })

  it('setiap pesan WA memuat {tamu}, {mempelai}, dan {link}', () => {
    for (const id of ids) {
      for (const code of ['{tamu}', '{mempelai}', '{link}']) expect(TEXT_TEMPLATES[id].wa).toContain(code)
    }
  })

  it('nuansa agama sesuai template', () => {
    expect(TEXT_TEMPLATES.kristen.intro).toContain('Tuhan Yesus Kristus')
    expect(TEXT_TEMPLATES.kristen.opening).toContain('Kejadian 2:24')
    expect(TEXT_TEMPLATES.kristen.closing).toContain('Tuhan Yesus memberkati')
    expect(TEXT_TEMPLATES.katolik.opening).toContain('Markus 10:9')
    expect(TEXT_TEMPLATES.katolik.closing).toContain('Berkah Dalem')
    expect(TEXT_TEMPLATES.islam.intro).toContain('Allah SWT')
    expect(TEXT_TEMPLATES.islam.opening).toContain('Ar-Rum: 21')
    expect(TEXT_TEMPLATES.umum.opening).toBe('')
  })

  it('template Umum sama persis dengan teks lama (undangan lama tidak berubah)', () => {
    expect(TEXT_TEMPLATES.umum.intro).toBe('Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan:')
    expect(TEXT_TEMPLATES.umum.closing).toBe(
      'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    )
    const p = { guestName: 'Pak Joko', coupleName: 'Budi & Ani', link: 'https://x.app/budi-ani?to=Pak+Joko' }
    // Teks pesan WA sebelum fitur template, ditulis apa adanya.
    const legacy = `Kepada Yth.
Bapak/Ibu/Saudara/i *Pak Joko*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

*Budi & Ani*

Berikut link undangan kami:
https://x.app/budi-ani?to=Pak+Joko

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.`
    expect(fillWaMessage(TEXT_TEMPLATES.umum.wa, p)).toBe(legacy)
    expect(waMessage(p)).toBe(legacy)
  })
})

describe('fillWaMessage', () => {
  const p = { guestName: 'Pak Joko', coupleName: 'Budi & Ani', link: 'https://x.app/b?to=Pak+Joko' }

  it('mengganti semua kode, termasuk yang muncul lebih dari sekali', () => {
    expect(fillWaMessage('{tamu}|{mempelai}|{link}|{tamu}', p)).toBe('Pak Joko|Budi & Ani|https://x.app/b?to=Pak+Joko|Pak Joko')
  })

  it("nama berisi pola $ tidak merusak hasil (bukan pola replace)", () => {
    expect(fillWaMessage('Yth. {tamu}', { ...p, guestName: "Bu $& $' Sri" })).toBe("Yth. Bu $& $' Sri")
  })

  it('nama berisi kode lain tidak ikut diganti', () => {
    expect(fillWaMessage('{tamu} — {link}', { ...p, guestName: 'Om {link}' })).toBe('Om {link} — https://x.app/b?to=Pak+Joko')
  })
})

describe('effectiveTexts', () => {
  it('kolom kosong (undangan lama) memakai template Umum; ayat kosong tetap kosong', () => {
    const t = effectiveTexts(makeInvitation({ intro_text: null, closing_text: null, wa_message: null, opening_text: null }))
    const umum = templateTexts('umum')
    expect(t).toEqual({ ...umum, opening: '' })
  })

  it('memakai teks yang tersimpan', () => {
    const t = effectiveTexts(makeInvitation({ intro_text: 'A', opening_text: 'B', closing_text: 'C', wa_message: 'D {link}' }))
    expect(t).toEqual({ intro: 'A', opening: 'B', closing: 'C', wa: 'D {link}' })
  })
})

describe('findTemplate', () => {
  it('mengenali template yang dipakai, atau null bila sudah diedit', () => {
    const katolik = templateTexts('katolik')
    expect(findTemplate(katolik)).toBe('katolik')
    expect(findTemplate({ ...katolik, intro: 'Lain' })).toBeNull()
  })
})

describe('matchesTemplate', () => {
  it('true bila keempat teks sama dengan salah satu template', () => {
    const kristen = templateTexts('kristen')
    expect(matchesTemplate(kristen)).toBe(true)
  })

  it('false bila ada yang sudah diubah', () => {
    const kristen = templateTexts('kristen')
    expect(matchesTemplate({ ...kristen, closing: kristen.closing + ' Amin.' })).toBe(false)
  })
})
