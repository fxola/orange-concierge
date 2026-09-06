import { Text } from '@/components/ui/text';

export function BrandMark({ collapsed }: Readonly<{ collapsed: boolean }>) {
  return (
    <span className={['flex min-w-0 items-center', collapsed ? 'gap-0' : 'gap-2.5'].join(' ')}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-primary font-display text-sm font-bold text-white"
      >
        Oc
      </span>

      <Text
        as={'span'}
        aria-hidden={collapsed}
        variant="caption"
        className={`overflow-hidden whitespace-nowrap text-sm font-regular
          leading-tight tracking-wide text-white
          transition-[max-width,opacity] duration-200 ease-cubic
           ${collapsed ? `max-w-0 opacity-0` : `max-w-44 opacity-100`}`}
      >
        Orange
        <br />
        Concierge
      </Text>
      <span
        className={[
          'overflow-hidden whitespace-nowrap text-sm font-light leading-tight tracking-wide transition-[max-width,opacity] duration-200 ease-cubic',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-44 opacity-100',
        ].join(' ')}
        aria-hidden={collapsed}
      ></span>
    </span>
  );
}
