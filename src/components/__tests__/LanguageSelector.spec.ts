import { render, screen } from 'test/helper';
import LanguageSelector from '../LanguageSelector.vue';

describe( 'Language selector', () => {
  describe.each( [
    { language: 'de', text: 'Anmeldung' },
    { language: 'en', text: 'Sign Up' }
  ] )( 'when user select $language', ( { language, text } ) => {
    it( 'displays expected text', async () => {
      const TempComponent = {
        components: {
          LanguageSelector
        },
        template: `
            <span>{{ $t('signUp') }}</span>
            <LanguageSelector />
            `
      };

      const { user } = render( TempComponent );
      await user.click( screen.getByTestId( `language-${ language }-selector` ) );
      expect( screen.getByText( text ) ).toBeInTheDocument();
    } );

    it( 'stores selected language in local storage', async () => {
      const TempComponent = {
        components: {
          LanguageSelector
        },
        template: `
            <span>{{ $t('signUp') }}</span>
            <LanguageSelector />
            `
      };
      const { user } = render( TempComponent );
      await user.click( screen.getByTestId( `language-${ language }-selector` ) );
      expect( localStorage.getItem( 'app-language' ) ).toBe( language );
    } );
  } );
} );
