/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ToolbarControls } from '../controls';

describe( 'Eventbrite block controls', () => {
	const setEditingUrl = jest.fn();
	const defaultProps = {
		setEditingUrl,
	};

	beforeEach( () => {
		setEditingUrl.mockClear();
	} );


	test( 'renders okay', () => {
		render( <ToolbarControls { ...defaultProps } /> );

		expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
	} );

	test( 'fires click handler okay', async () => {
		const user = userEvent.setup();
		render( <ToolbarControls { ...defaultProps } /> );
		await user.click( screen.getByRole( 'button' ) );

		expect( setEditingUrl ).toHaveBeenCalledWith( true );

	} );
} );
