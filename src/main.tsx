import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'

const stored = localStorage.getItem('theme')
const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
document.documentElement.dataset.theme = theme

render(<App />, document.getElementById('app')!)
