import * as allIcons from '@wordpress/icons';
import Col from '../../layout/col';
import Container from '../../layout/container';
import Text, { H3 } from '../../text';
import Button from '../index';
import Doc from './Button.mdx';
import styles from './style.module.scss';

const { Icon: WPIcon, ...icons } = allIcons;
const { check, cloud } = icons;

const DisableVariant = {
	variant: {
		table: {
			disable: true,
		},
	},
};

const DisableDisabled = {
	disabled: {
		table: {
			disable: true,
		},
	},
};

const DisableIsDestructive = {
	isDestructive: {
		table: {
			disable: true,
		},
	},
};

const DisableIsLoading = {
	isLoading: {
		table: {
			disable: true,
		},
	},
};

const DisableIcon = {
	icon: {
		table: {
			disable: true,
		},
	},
};

const disableClassName = {
	className: {
		table: {
			disable: true,
		},
	},
};

export default {
	title: 'JS Packages/Components/Button',
	component: Button,
	argTypes: {
		variant: {
			control: {
				type: 'select',
				options: [ 'primary', 'secondary', 'link' ],
			},
		},
		size: {
			control: {
				type: 'select',
				options: [ 'normal', 'small' ],
			},
		},
		weight: {
			control: {
				type: 'select',
				options: [ 'bold', 'regular' ],
			},
		},
		icon: {
			control: {
				type: 'select',
				options: [ 'none', ...Object.keys( icons ) ],
			},
		},
	},
	parameters: {
		backgrounds: {
			default: 'Jetpack Dashboard',
		},
		docs: {
			page: Doc,
		},
	},
};

const DefaultTemplate = args => {
	const icon = args?.icon && args?.icon !== 'none' ? <WPIcon icon={ icons[ args.icon ] } /> : null;
	return <Button { ...args } icon={ icon } />;
};

export const _default = DefaultTemplate.bind( {} );
_default.args = {
	variant: 'primary',
	size: 'normal',
	weight: 'bold',
	icon: 'cloud',
	isExternalLink: false,
	isLoading: false,
	disabled: false,
	isDestructive: false,
	children: 'Once upon a time… a button story',
};

const Template = args => <Button { ...args } />;

export const ButtonPrimary = Template.bind( {} );
ButtonPrimary.argTypes = {
	...DisableVariant,
	...DisableDisabled,
	...DisableIcon,
	...DisableIsLoading,
	...DisableIsDestructive,
};
ButtonPrimary.args = {
	size: 'normal',
	children: 'Jetpack Button',
	variant: 'primary',
};

export const ButtonSecondary = Template.bind( {} );
ButtonSecondary.argTypes = {
	...DisableVariant,
	...DisableDisabled,
	...DisableIcon,
	...DisableIsLoading,
	...DisableIsDestructive,
	...disableClassName,
};
ButtonSecondary.args = {
	size: 'normal',
	children: 'Jetpack Button',
	variant: 'secondary',
};

export const ButtonLink = Template.bind( {} );
ButtonLink.argTypes = {
	...DisableVariant,
	...DisableDisabled,
	...DisableIcon,
	...DisableIsLoading,
	...DisableIsDestructive,
	...disableClassName,
};
ButtonLink.args = {
	size: 'normal',
	children: 'Jetpack Button',
	variant: 'link',
};

export const Icon = Template.bind( {} );
Icon.argTypes = {
	...DisableIcon,
	...DisableDisabled,
	...DisableIsLoading,
	...DisableIsDestructive,
	...disableClassName,
};
Icon.args = {
	size: 'normal',
	children: 'Jetpack Button',
	icon: <WPIcon icon={ check } />,
	variant: 'primary',
};

export const Disabled = Template.bind( {} );
Disabled.argTypes = {
	...DisableDisabled,
	...DisableIsDestructive,
	...DisableIsLoading,
	...disableClassName,
};
Disabled.args = {
	size: 'normal',
	children: 'Jetpack Button',
	variant: 'primary',
	disabled: true,
};

export const Destructive = Template.bind( {} );
Destructive.argTypes = {
	...DisableIsDestructive,
	...DisableIsLoading,
	...DisableDisabled,
	...disableClassName,
};
Destructive.args = {
	size: 'normal',
	children: 'Jetpack Button',
	variant: 'primary',
	isDestructive: true,
};

export const Loading = Template.bind( {} );
Loading.argTypes = {
	...DisableIsDestructive,
	...DisableIsLoading,
	...DisableDisabled,
	...disableClassName,
};
Loading.args = {
	size: 'normal',
	children: 'Jetpack Button',
	variant: 'primary',
	isLoading: true,
};

export const VariantsAndProps = () => {
	const variants = [ 'primary', 'secondary', 'link' ];
	return (
		<>
			<Container>
				<Col>
					<H3>Variants & Props</H3>
				</Col>
				<Col>
					<Text mb={ 3 }>
						The following shows how the properties modify the appearance and/or behavior of the
						button, in the different variants. Keep in mind that you cannot combine the variants but
						you can combine the props. Use the { '' }
						<a href="./?path=/story/js-packages-components-button--default">default story</a> to
						play with the combinations.
					</Text>
				</Col>
			</Container>
			<Container className={ styles.container } horizontalGap={ 0 }>
				<Col
					className={ `${ styles[ 'row-instance' ] } ${ styles.header }` }
					sm={ 4 }
					md={ 2 }
					lg={ 3 }
				>
					<Text size="body-extra-small">props / variants</Text>
				</Col>

				<Col sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small" className={ styles.header }>
						Primary
					</Text>
				</Col>

				<Col sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small" className={ styles.header }>
						Secondary
					</Text>
				</Col>

				<Col sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small" className={ styles.header }>
						Link
					</Text>
				</Col>

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">no props</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } />
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">size: small</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } size="small" />
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">weight: regular</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } weight="regular" />
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">icon (cloud)</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button
							{ ...ButtonPrimary.args }
							variant={ variant }
							icon={ <WPIcon icon={ cloud } /> }
						/>
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">disabled</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } disabled />
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">isDestructive</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } isDestructive />
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">isExternalLink</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } isExternalLink />
					</Col>
				) ) }

				<Col className={ styles[ 'row-instance' ] } sm={ 4 } md={ 2 } lg={ 3 }>
					<Text size="body-extra-small">isLoading</Text>
				</Col>
				{ variants.map( variant => (
					<Col sm={ 4 } md={ 2 } lg={ 3 }>
						<Button { ...ButtonPrimary.args } variant={ variant } isLoading />
					</Col>
				) ) }
			</Container>
		</>
	);
};
VariantsAndProps.storyName = 'Variants & Props';
