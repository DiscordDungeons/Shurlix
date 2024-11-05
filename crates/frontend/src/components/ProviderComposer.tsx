import { ComponentChildren, ComponentType, VNode } from 'preact'

type ProviderProps = {
    children: ComponentChildren;
};

type Props = {
	children: ComponentChildren,
	providers: ComponentType<ProviderProps>[],
}

export const ProviderComposer = ({
	children,
	providers,
}: Props) => providers.reduce<VNode>(
	(AccumulatedProviders, CurrentProvider) => (
		<CurrentProvider>{AccumulatedProviders}</CurrentProvider>
	),
	children as VNode,
)
