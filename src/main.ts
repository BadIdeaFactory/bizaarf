import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');
if (target === null) {
	throw new Error('Could not find the #app mount target in the document.');
}

const app = mount(App, { target });

export default app;
