import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '../LanguageSelector.vue'

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
        expect(i18n.locale).toBe(language)
      })
    }
  )
})
