# Vue Testing Project

This project is a practical exploration of Vue 3 and Test-Driven Development (TDD) methodology, inspired by the Udemy course by Basar Buyukkahraman. The course provides a comprehensive introduction to Vue 3, one of the most popular frontend frameworks, by building a web application from scratch and applying TDD principles throughout the process.

## What I Cover

In this project, I delve into various aspects of Vue 3 and TDD, including:

- Composition API
- Client-side routing with a custom implementation and then using the vue-router library
- Internationalization with vue-i18n
- Global state management in a component-based application using Pinia
- The workings of Test-Driven Development
- The difference between integration and unit tests
- How TDD affects code quality and reusability
- How TDD gives me confidence about refactoring my implementation
- How to avoid implementation details while creating tests

## Approach

The project is built entirely on practice. Each piece of code written is for the actual application implementation. I gradually build the application in each section, implementing one requirement at a time. This approach helps me gain a solid foundation about overall web application requirements and how to implement them with Vue by following TDD methodology.

## TypeScript Support

To further challenge myself, I decided to set up and implement the project using TypeScript instead of JavaScript as described in the course. TypeScript provides static types to the code, enhancing the development experience by providing better tooling and allowing me to catch errors early during development. Please note that due to this, some parts of the project may differ from the original course content.

## Outcome

Upon completion of this project, I have a deeper understanding of Vue 3 and the benefits of Test-Driven Development. I am now equipped with the knowledge and experience to use Vue in my next project and apply TDD principles to improve my code quality and development process.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
