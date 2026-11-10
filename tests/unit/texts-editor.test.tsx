import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TextsEditor } from '@/components/admin/TextsEditor'
import { TEXT_TEMPLATES, templateTexts } from '@/lib/text-templates'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#x27;')
const selected = (html: string) => html.match(/<option value="(\w+)" selected="">/)?.[1]

describe('TextsEditor', () => {
  it('undangan baru: terisi template Umum dan Umum terpilih', () => {
    const html = renderToStaticMarkup(<TextsEditor errors={{}} />)
    expect(selected(html)).toBe('umum')
    expect(html).toContain(esc(TEXT_TEMPLATES.umum.intro))
    expect(html).toContain(esc(TEXT_TEMPLATES.umum.closing))
    for (const name of ['intro_text', 'opening_text', 'closing_text', 'wa_message']) expect(html).toContain(`name="${name}"`)
  })

  it('undangan yang memakai template Kristen: Kristen terpilih', () => {
    const kristen = templateTexts('kristen')
    const html = renderToStaticMarkup(<TextsEditor initial={kristen} errors={{}} />)
    expect(selected(html)).toBe('kristen')
    expect(html).toContain('Tuhan Yesus memberkati.')
  })

  it('menampilkan pesan error per kolom', () => {
    const html = renderToStaticMarkup(<TextsEditor errors={{ wa_message: 'Pesan WhatsApp harus memuat kode {link}' }} />)
    expect(html).toContain('Pesan WhatsApp harus memuat kode {link}')
  })
})
