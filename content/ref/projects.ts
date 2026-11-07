import data from './projects.json';

/** Projects page, verbatim from the reference (one block per client, 4 photos each). Data: projects.json. */
export interface ProjectBlock {
  id: string;
  /** Plain client name (the title without markup). */
  name: string;
  logo: string;
  logoAlt: string;
  titleHtml: string;
  note: string;
  images: { src: string; alt: string }[];
}
export const projectBlocks: ProjectBlock[] = data;
