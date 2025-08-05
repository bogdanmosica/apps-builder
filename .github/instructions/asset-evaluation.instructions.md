---
applyTo: "apps/asset-evaluation/**"
---

# 🎨 Design System: Foundation (Energetic & Bold)

## 🟡 Color Palette
| Purpose                | Tailwind Token   | HEX       | Notes                                            |
| ---------------------- | ---------------- | --------- | ------------------------------------------------ |
| Primary (action/CTA)   | `primary`        | `#FF6B00` | Energetic orange for calls-to-action, highlights |
| Primary hover/dark     | `primary-dark`   | `#D95400` | Button hover states, focused elements            |
| Secondary (support)    | `secondary`      | `#1CA8DD` | Vivid teal for accents, step indicators          |
| Background (main)      | `bg-base`        | `#F9F9F9` | Light neutral base for cards and surfaces        |
| Background (app shell) | `bg-shell`       | `#FFFFFF` | Shell-level areas, clean white                   |
| Text (base)            | `text-base`      | `#1A1A1A` | Primary readable text                            |
| Text (muted)           | `text-muted`     | `#6B7280` | Subtext, captions, helper labels                 |
| Status (success)       | `status-success` | `#28A745` | Gamification positive feedback                   |
| Status (warning)       | `status-warning` | `#FFC107` | Alert or missing answer cues                     |
| Status (danger)        | `status-danger`  | `#DC3545` | Error states, destructive actions                |

## 🔠 Typography
| Role            | Tailwind Class         | Font              | Weight    | Usage               |
| --------------- | ---------------------- | ----------------- | --------- | ------------------- |
| Heading (H1)    | `text-3xl md:text-4xl` | Inter, sans-serif | Bold      | Page titles         |
| Subheading (H2) | `text-xl md:text-2xl`  | Inter             | Semi-bold | Section labels      |
| Body (default)  | `text-base`            | Inter             | Normal    | Paragraphs, labels  |
| Small text      | `text-sm`              | Inter             | Normal    | Captions, help text |

## 🧩 shadcn/ui Component Behaviors
| Component           | Usage                             | Custom Behavior Notes                                  |
| ------------------- | --------------------------------- | ------------------------------------------------------ |
| `Button`            | Add Property, Save, Invite        | Use `variant="default"` for orange, `ghost` for inline |
| `Card`              | Property tiles, form wizard steps | Add subtle shadow and hover state                      |
| `Dialog`            | Confirm deletes, invite overlay   | Use for inviting family/friends                        |
| `Tabs`              | Question categories per property  | Dynamic rendering per property type                    |
| `Input`, `Textarea` | Forms                             | Full width, mobile-first optimized                     |
| `Progress`          | Wizard stepper, gamification      | Animated progress and unlock visuals                   |

## 💫 UX Direction
| Trait           | Application Behavior                                            |
| --------------- | --------------------------------------------------------------- |
| Mobile-first    | Touch-friendly targets, large tap zones                         |
| Motivational    | Celebrate milestone completion (confetti, stars)                |
| Visual guidance | Use icons (e.g. [Lucide Icons](https://lucide.dev)) for clarity |
| Feedback loops  | Immediate visual response on scoring, answer changes            |
| Offline-aware   | Show “Pending Sync” indicators with refresh control             |

## 🏆 Gamification Starter Ideas
| Milestone               | Reward Type                        |
| ----------------------- | ---------------------------------- |
| Add first property      | Unlock avatar background theme     |
| Add 5 properties        | Unlock badge (e.g. “Explorer”)     |
| Complete 100% checklist | Visual seal (animated star rating) |
| Invite family member    | Cosmetic flair or confetti burst   |


## Code style guide

- Use consistent naming conventions (e.g. camelCase for variables and functions)
- Keep functions small and focused on a single task
- Write clear and concise comments to explain complex logic
- Use TypeScript types and interfaces for better code clarity
- Follow the DRY (Don't Repeat Yourself) principle
- Use only seed.ts to seed database. Don't create separate migration files for seeding data.
- Always run the app into a new terminal using `cd apps/asset-evaluation; pnpm dev`