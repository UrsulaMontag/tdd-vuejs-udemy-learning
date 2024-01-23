import { render, screen } from 'test/helper'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '../LanguageSelector.vue'

describe('Language selector', () => {
  describe.each([
    { language: 'de', text: 'Anmeldung' },
    { language: 'en', text: 'Sign Up' }
  ])('when user select $language', ({ language, text }) => {
    it('displays expected text', async () => {
      const user = userEvent.setup()

      const TempComponent = {
        components: { LanguageSelector },
        template: `
            <span>{{$t('signUp')}}</span>
            <LanguageSelector />`
      }
      render(TempComponent)
      await user.click(screen.getByTestId(`language-${language}-selector`))
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })
})
