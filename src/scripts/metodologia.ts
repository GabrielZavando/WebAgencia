export function initAccordion(): void {
  console.log('Metodologia: Initializing accordion...')
  const cards = document.querySelectorAll<HTMLElement>('.phase-card')
  
  if (cards.length === 0) {
    console.warn('Metodologia: No cards found')
    return
  }

  cards.forEach((card: HTMLElement) => {
    const header = card.querySelector<HTMLElement>('.phase-card__header')
    if (header) {
      header.onclick = (e) => {
        e.preventDefault()
        const isOpen = card.classList.contains('is-open')
        
        // Cerrar todas
        cards.forEach((c: HTMLElement) => {
          c.classList.remove('is-open')
          const span = c.querySelector('.toggle-text')
          if (span) span.textContent = 'expandir'
        })
        
        if (!isOpen) {
          card.classList.add('is-open')
          const span = card.querySelector('.toggle-text')
          if (span) span.textContent = 'contraer'
        }
      }
    }
  })
}
