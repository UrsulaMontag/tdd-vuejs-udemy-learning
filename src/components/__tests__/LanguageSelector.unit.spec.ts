vi.hoisted(() => vi.resetModules())

import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { useI18n, type Composer } from 'vue-i18n'
import { ref } from 'vue'
import { LanguageSelector } from '..'

const mockI18n: Partial<Composer> = { locale: ref('en') as any }
vi.mock('vue-i18n')
vi.mocked(useI18n).mockReturnValue(mockI18n as Composer)

describe('Language selector', () => {
  describe.each([{ language: 'de' }, { language: 'en' }])(
    'when user select $language',
    ({ language }) => {
      it('displays expected text', async () => {
        const user = userEvent.setup()
        const i18n = { locale: 'en' }
        render(LanguageSelector, {
          global: { mocks: { $i18n: i18n } }
        })
        await user.click(screen.getByTestId(`language-${language}-selector`))
        expect(mockI18n.locale?.value).toBe(language)
      })

      it('stores selected language in local storage', async () => {
        const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
        const user = userEvent.setup()
        const i18n = { locale: 'en' }

        render(LanguageSelector, {
          global: { mocks: { $i18n: i18n } }
        })
        await user.click(screen.getByTestId(`language-${language}-selector`))
        expect(mockSetItem).toHaveBeenCalledWith('app-language', language)
      })
    }
  )
})
