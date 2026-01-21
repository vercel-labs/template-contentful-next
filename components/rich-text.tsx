import { ContentfulImage } from "@/components/contentful-image";
import { documentToReactComponents, Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, Document } from "@contentful/rich-text-types";

const richTextOptions: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => <p className="mb-4">{children}</p>,
    [BLOCKS.HEADING_1]: (_node, children) => (
      <h1 className="mb-4 text-3xl font-semibold">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="mb-4 text-2xl font-semibold">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mb-4 text-xl font-semibold">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node, children) => (
      <h4 className="mb-4 text-lg font-semibold">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (_node, children) => (
      <h5 className="mb-4 text-base font-semibold">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (_node, children) => (
      <h6 className="mb-4 text-sm font-semibold">{children}</h6>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => (
      <ContentfulImage
        src={node.data.target.url}
        alt={node.data.target.description}
        width={node.data.target.details.image.width}
        height={node.data.target.details.image.height}
      />
    ),
  },
};

export function RichText({ content }: { content: Document }) {
  return documentToReactComponents(content, richTextOptions);
}
