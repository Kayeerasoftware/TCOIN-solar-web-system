import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@/store/authStore';
import { renderApp, signInAs } from '@/tests/routerHelpers';

describe('sign in', () => {
  it('signs a staff user in and opens the console', async () => {
    const { router } = renderApp('/login');
    await userEvent.type(await screen.findByLabelText('Email or phone'), 'admin@tcoinug.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Admin@123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/console'));
    expect(useAuthStore.getState().user?.full_name).toBe('Kayeera Nathan');
  });

  it('shows the server message for a wrong password', async () => {
    renderApp('/login');
    await userEvent.type(await screen.findByLabelText('Email or phone'), 'admin@tcoinug.com');
    await userEvent.type(screen.getByLabelText('Password'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Wrong email, phone, or password')).toBeInTheDocument();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('shows field errors for an empty form without calling the server', async () => {
    renderApp('/login');
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Email or phone is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('asks for the code when the account uses two-step verification', async () => {
    const { router } = renderApp('/login');
    await userEvent.type(await screen.findByLabelText('Email or phone'), 'mfa@tcoinug.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Admin@123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await userEvent.type(await screen.findByLabelText('Code'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/console'));
  });

  it('lets a customer sign in with a phone code', async () => {
    const { router } = renderApp('/otp');
    await userEvent.type(await screen.findByLabelText('Phone number'), '+256 700 111 222');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    await userEvent.type(await screen.findByLabelText('Code'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/portal'));
  });

  it('rejects a wrong phone code', async () => {
    renderApp('/otp');
    await userEvent.type(await screen.findByLabelText('Phone number'), '+256 700 111 222');
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    await userEvent.type(await screen.findByLabelText('Code'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByText('That code is not correct')).toBeInTheDocument();
  });
});

describe('route guards', () => {
  it('sends anonymous visitors from the console to sign in', async () => {
    const { router } = renderApp('/console');
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
  });
  it('blocks a customer from the staff console', async () => {
    signInAs('customer');
    renderApp('/console');
    expect(await screen.findByText('Not permitted')).toBeInTheDocument();
  });
  it('blocks staff who lack a page permission', async () => {
    signInAs('finance');
    renderApp('/console/leads');
    expect(await screen.findByText('Not permitted')).toBeInTheDocument();
  });
});
