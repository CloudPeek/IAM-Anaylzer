
/**
 * Renders the layout component.
 * src/components/Layout.js
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the layout.
 * @returns {React.ReactNode} The rendered layout component.
 */
import { Header } from '@/components/Header'

export function Layout({ children }) {
  return (
    <>
      <div className="fixed inset-0 flex justify-center sm:px-8">
        <div className="flex w-full max-w-7xl lg:px-8">
          <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
        </div>
      </div>
      <div className="relative flex w-full flex-col">
       <Header>{children}</Header>
      </div>
    </>
  )
}
