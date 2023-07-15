import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from '@lexical/react/LexicalAutoLinkPlugin';

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_MATCHER, (text) => {
    return text.startsWith('http') ? text : `https://${text}`;
  }),
];

export default function AutoLink(): JSX.Element {
  return <AutoLinkPlugin matchers={MATCHERS} />;
}
