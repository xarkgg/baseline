# Pixel Perfect Website

# TASK: Convert Uploaded Design Image into a Fully Functional Website

You are an expert UI/UX designer and senior frontend developer. Your task is to convert the uploaded design image into a fully functional, production-quality website.

## 1. PRIMARY INSTRUCTION: THE IMAGE IS THE SINGLE SOURCE OF TRUTH

Treat the uploaded image as the absolute visual reference and single source of truth for the website.

Your job is to RECREATE the design in the image as accurately as possible using live, editable frontend code.

This is not a redesign, reinterpretation, or an opportunity to introduce your own creative direction.

You must:
- Replicate the exact layout, structure, spacing, alignment, proportions, and positioning of elements.
- Match the typography, font sizes, font weights, line heights, and letter spacing.
- Reproduce the colors, backgrounds, borders, shadows, gradients, and visual effects.
- Match the sizes and proportions of buttons, cards, containers, images, icons, and other UI elements.
- Preserve the visual hierarchy and overall aesthetic of the original design.
- Recreate all visible sections and elements, including elements that might seem minor.
- Maintain the same visual balance and composition as the reference image.

**IMPORTANT:** Do not use the uploaded image as a background image or simply place it inside the webpage. Rebuild the actual interface using real HTML elements, CSS, and appropriate assets.

The final result must be a genuine, functional website that visually resembles the uploaded design as closely as possible.

## 2. DESIGN SPECIFICATIONS AND BRAND GUIDELINES

Use the following specifications as additional context when interpreting and implementing the reference image.

**Fonts:**
Manrope Font Family

**Color Palette:**
#FC7557
#31CFB7
#7F9DFF
#FFC37A


If any of these specifications conflict with clearly visible details in the reference image, prioritize the image unless explicitly instructed otherwise.

## 3. LAYOUT AND STRUCTURE

Carefully analyze the reference image before writing any code.

Identify:
- Every visible section and its order.
- The overall page width and content boundaries.
- Header and navigation structure.
- Hero section composition.
- Image and text placement.
- Content containers and grid layouts.
- Card structures and repeated components.
- Buttons, links, forms, and interactive elements.
- Footer structure, if visible.

Recreate the page section by section.

Do not omit any visible elements or introduce sections that do not belong in the reference design.

## 4. RESPONSIVE DESIGN

Although the uploaded image is the primary reference, the website must also work perfectly across different screen sizes.

Create responsive versions for:
- Desktop.
- Laptop.
- Tablet.
- Mobile.

Preserve the original design language, visual hierarchy, and proportions as closely as possible at each breakpoint.

Do not simply shrink the desktop layout on mobile. Adapt the layout intelligently while retaining the original design's identity.

## 5. FUNCTIONALITY

Convert all visible interface elements into actual functional components.

Examples:
- Navigation links should navigate to their intended sections or pages.
- Buttons should perform their intended actions.
- Dropdown menus should open and close properly.
- Forms should accept user input and provide appropriate feedback.
- Mobile navigation should work correctly.
- Interactive elements should have appropriate hover, focus, and active states.

Do not create decorative buttons that do nothing.

Where the reference image does not provide enough information about an interaction, implement a sensible, consistent behavior without changing the visual design.

## 6. IMAGES, ICONS, AND ASSETS

Use the reference image to determine the intended visual assets.

- Reproduce images, illustrations, and visual elements as closely as possible.
- Use supplied assets whenever available.
- Do not substitute important images with unrelated stock photography.
- Use appropriate icons that closely match the reference.
- Preserve image aspect ratios, cropping, and positioning.
- Do not use emojis as substitutes for designed icons.
- If an asset cannot be identified or supplied, use the closest appropriate alternative while preserving the original composition.

## 7. DEVELOPMENT REQUIREMENTS

Build the website using clean, modern, maintainable frontend code.

Preferred stack:
- React.
- TypeScript.
- Tailwind CSS.
- Lucide icons where appropriate.

Additional requirements:
- Use reusable components.
- Maintain consistent spacing and typography.
- Use semantic HTML.
- Ensure accessibility and keyboard navigation.
- Optimize images and assets.
- Avoid unnecessary dependencies.
- Ensure the website loads correctly without errors.
- Keep the code organized and easy to modify.

## 8. VISUAL ACCURACY AND QUALITY CONTROL

After building the website, compare the rendered webpage against the uploaded reference image.

Perform multiple visual refinement passes.

Pay particular attention to:
- Element positioning.
- Margins and padding.
- Font selection and typography.
- Section heights and widths.
- Image sizing and cropping.
- Background colors.
- Border thickness and radius.
- Button dimensions.
- Alignment and whitespace.
- Overall visual composition.

Fix any discrepancies you identify.

Do not stop at a version that merely captures the general aesthetic. Aim for the closest possible visual match to the original image.

## 9. FINAL INSTRUCTION

Your highest priority is VISUAL FIDELITY.

The uploaded image is the design specification. The additional design guidelines are supporting information.

Do not redesign, simplify, modernize, or creatively reinterpret the reference.

Do not add unnecessary animations, decorative elements, sections, or effects that are not present in the reference.

Build the website to look as close to the uploaded image as technically possible while ensuring that it is responsive, functional, accessible, and production-ready.

**Think like a pixel-perfect frontend developer whose responsibility is to translate an existing visual design into a live website, not a designer being asked to create something new.**

This project is built with React, TypeScript, Vite, and Tailwind CSS.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
