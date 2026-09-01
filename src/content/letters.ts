import type { Letter } from './types'
import { config } from './config'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE HIDDEN SURPRISE — five sealed envelopes he opens whenever        ║
 * ║  he needs them.                                                       ║
 * ║                                                                      ║
 * ║  Each line becomes its own paragraph, revealed one at a time with     ║
 * ║  a warm handwritten animation.                                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const letters: Letter[] = [
  {
    id: 'happy',
    emoji: '💌',
    title: "open when you're happy",
    body: [
      'Unna happy ah paakuradhu enakum romba sandhosham. ❤️',
      'Enna nadandhaalum, nee happy ah irukanum, healthy ah irukanum, nalla irukanum nu always nenappen.',
      'Ippo edhuku happy ah iruka nu enaku sollanum okay? 😂 Enna matter ah irundhaalum seri, I want to hear it.',
      'Un happy moments la mattum illa, un kashtamana days layum naan iruppen.',
      'Nee happy ah irukanum. Adhu dhaan important. ❤️',
    ],
    signoff: `— ${config.her.name}`,
  },
  {
    id: 'miss',
    emoji: '💌',
    title: 'open when you miss me',
    body: [
      'Enna miss panriya? 👀',
      'Seri seri... naanum unna miss pannitu iruppen. 😂',
      'Eppo enna venalum call or text pannalam. Time paaka vendam.',
      'Naan unaku eppovume iruppen, just remember that.',
      'Nee enna nalla pathukara maari, naanum unna nalla pathukanum nu always aasapaduven.',
      'So romba miss panna, just call me. Naan irukken. ❤️',
    ],
    signoff: `— ${config.her.name}`,
  },
  {
    id: 'motivation',
    emoji: '💌',
    title: 'open when you need motivation',
    body: [
      'Dei, first calm down. 😂',
      'Edhu nadandhaalum, nee handle panniduva nu enaku theriyum.',
      'Nee edhavadhu oru vishayatha serious ah eduthuta, adha achieve panna nee evlo work pannuva nu naan paathirukken.',
      'So ippo konjam tired ah irundhaalum, give up pannadha.',
      'Konjam rest edu, apram thirumba start pannu.',
      'Un mela unaku doubt vandhaalum parava illa, naan unna namburen. ❤️',
      'Nee mudiyum. Always.',
    ],
    signoff: `— ${config.her.name}`,
  },
  {
    id: 'smile',
    emoji: '💌',
    title: 'open when you want to smile',
    body: [
      'Seri, ippo smile pannanum. 😂',
      'Namma rendu perum serndhaale edhavadhu comedy aagidum la.',
      'Namma pesina random conversations, namma panra loosu things, andha particular memory... nenachaale sirippu varum. 😂',
      'And honestly, un kooda irukkura indha random moments dhaan enaku romba pidikkum.',
      'So smile pannitu iru.',
      'Un smile ah paaka enakum pudikkum. ❤️',
    ],
    signoff: `— ${config.her.name}`,
  },
  {
    id: 'bad-day',
    emoji: '💌',
    title: 'open on a bad day',
    body: [
      'Inniku day nalla pogalaya?',
      'Seri... ellame ippo solve aaganum nu avasiyam illa.',
      'Konjam relax pannu. Nalla saapdu. Konjam rest edu.',
      'Edhu venalum en kitta sollalam. Naan judge panna maaten.',
      'Unakku kashtama irukkumbodhu, nee thaniya handle panna vendam.',
      'Nalla irukkumbodhu mattum illa, kashtama irukkumbodhum naan iruppen.',
      'And one more thing...',
      'Naan unna nalla pathupen. Nee-yum enna nalla pathukanum. Maraka koodadhu. ❤️',
    ],
    signoff: `— ${config.her.name}`,
  },
]
