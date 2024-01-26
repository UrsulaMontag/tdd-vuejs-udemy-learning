import { vi } from 'vitest'
import { createInstance } from '.'

const mockNavigatorLangauage = vi.spyOn(window.navigator, 'language', 'get')

afterEach(() => {
  mockNavigatorLangauage.mockReset()
})

describe('createInstance', () => {
  describe('when app-lang is not set in localStorage', () => {
    describe('when browser language is undefined', () => {
      it('sets the language is undefined', () => {
        mockNavigatorLangauage.mockReturnValue('')

        const i18n = createInstance()
        expect(i18n.global.locale.value).toBe('en')
      })
    })
    describe('when browser language is set', () => {
      it('sets the language as browser language', () => {
        mockNavigatorLangauage.mockReturnValue('ab')
        const i18n = createInstance()
        expect(i18n.global.locale.value).toBe('ab')
      })
    })
  })
  describe('when app-lang is set in localStorage', () => {
    it('sets the language as browser language', () => {
      localStorage.setItem('app-language', 'fr')
      const i18n = createInstance()
      expect(i18n.global.locale.value).toBe('fr')
    })
  })
})
