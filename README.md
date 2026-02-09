# Tangent DAPP

## Components

- Next.js (v15) for app framework
- Web3onboad for wallet connection
- Shadcnui + tailwind css as UI components
- Viem as blockchain framework.

## Directory organization

### Project Folder Structure

- `app/` - Next.js router
- `components/` - All components
  - `design_system/` - Basic design components
    - `form/`
    - `inputs/`
    - `list/`
    - `structure/`
  - `icons/` - Icons
  - `products/` - Product-linked components
    - `booster/` - Product booster
    - `examples/` - Code examples
    - `product_nav/` - Navigation elements for products and features
    - `splitter/` - Product booster
    - `wallet/` - Components for wallet connexion
    - `wrapper/` - Product wrapper
  - `ui/` - UI components (ShadCN)
- `hooks/` - Application-specific hooks
- `lib/` - Helper functions
- `services/` - Data fetching with a global purpose
- `types/` - All global types used in the app

### Example of a feature level organization

THe context,controller and specific types will be put in the components folder for better organisation
like this :

- `example_form/`
  - `example_form_context.tsx`
  - `example_form_controller.ts`
  - `example_form_type.ts`
  - `example_form_context.tsx`
  - `graphs/`
    - `graph_1.tsx`
    - `graph_2.tsx`

### File types & responsibilities

- **controller** : will be used
  - to get and transform data (prefix will **get** a **transform** )
  - to perform action (prefix **do** )
- **context** : standard react ps:a Context{xxx}Values type will be create for each
- **type** : all type used in this folder level.
- **components** : standard react components

## styling

use of tailwindcss https://tailwindcss.com/

## Commands

### Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
```

### Get path in server components (use header )

adpated from https://www.propelauth.com/post/getting-url-in-next-server-components
