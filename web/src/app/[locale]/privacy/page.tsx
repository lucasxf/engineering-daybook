'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function PrivacyContent() {
  const t = useTranslations('privacy');
  const params = useParams<{ locale: string }>();
  const isPtBR = params.locale === 'pt-BR';

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">{t('lastUpdated')}</p>

      <div className="space-y-8 text-slate-700 dark:text-slate-300">
        {isPtBR ? <PrivacyPtBR t={t} /> : <PrivacyEn t={t} />}
      </div>

      <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href={`/${params.locale}/login` as never}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          ← {isPtBR ? 'Voltar para o learnimo' : 'Back to learnimo'}
        </Link>
      </div>
    </div>
  );
}

type TFn = ReturnType<typeof useTranslations<'privacy'>>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function PrivacyEn({ t }: { t: TFn }) {
  return (
    <>
      <Section title={t('sections.intro')}>
        <p>
          learnimo is a personal learning journal that helps you capture, organize, and recall what
          you learn. This policy explains what data we collect, how we use it, and what rights you
          have over it.
        </p>
        <p>
          learnimo is an independent project by Lucas Xavier Ferreira. By using the learnimo mobile
          app or website, you agree to this policy.
        </p>
      </Section>

      <Section title={t('sections.dataCollected')}>
        <p>We collect only the data necessary to provide the service:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Account data:</strong> email address, display name, and a unique handle you
            choose.
          </li>
          <li>
            <strong>Content you create:</strong> the titles and text of the learnings you save,
            tags you create, and any notes you add.
          </li>
          <li>
            <strong>Profile data (optional):</strong> a short bio and a profile picture you upload.
          </li>
          <li>
            <strong>Preferences:</strong> language, theme, and visibility settings.
          </li>
          <li>
            <strong>Authentication tokens:</strong> stored securely on your device to keep you
            logged in.
          </li>
        </ul>
        <p>We do not collect location data, device identifiers, or usage analytics.</p>
      </Section>

      <Section title={t('sections.howWeUse')}>
        <p>Your data is used solely to provide and improve the learnimo service:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>To authenticate you and maintain your session.</li>
          <li>To store and retrieve your learnings.</li>
          <li>To generate tag suggestions from your learning content using an AI embedding model
            (the content is sent to a third-party API for processing — see below).</li>
          <li>To display your public profile and public learnings to other users, if you choose to
            make them public.</li>
        </ul>
        <p>
          We do not use your data for advertising, profiling, or any purpose other than operating
          the service. We do not sell your data to any third party.
        </p>
      </Section>

      <Section title={t('sections.storage')}>
        <p>
          Your data is stored in a managed PostgreSQL database hosted by{' '}
          <strong>Supabase</strong> (supabase.com). Profile pictures are stored in Supabase Storage.
          All data is transmitted over HTTPS.
        </p>
        <p>
          On mobile, authentication tokens are stored in your device&apos;s secure keychain using{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
            expo-secure-store
          </code>
          . They are never written to unprotected storage.
        </p>
      </Section>

      <Section title={t('sections.thirdParties')}>
        <p>learnimo uses the following third-party services:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Supabase</strong> — database hosting and file storage. Data is stored in their
            managed infrastructure. See{' '}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Supabase Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>HuggingFace Inference API</strong> — used to generate semantic embeddings from
            your learning content to power smart search. Content text is sent to HuggingFace for
            processing and is not stored by them beyond the request lifetime.
          </li>
          <li>
            <strong>Google OAuth</strong> (optional) — if you choose to sign in with Google, your
            Google account email and name are used to create your account. We do not receive your
            Google password. See{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Google Privacy Policy
            </a>
            .
          </li>
        </ul>
        <p>No advertising SDKs, analytics tools, or crash reporting services are embedded in the app.</p>
      </Section>

      <Section title={t('sections.yourRights')}>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Access and export:</strong> all your learnings are available in your feed and
            can be read at any time.
          </li>
          <li>
            <strong>Edit and delete:</strong> you can edit or delete any learning at any time from
            the app or website.
          </li>
          <li>
            <strong>Visibility control:</strong> you decide whether each learning is private (only
            you) or public. Private learnings are never visible to other users.
          </li>
          <li>
            <strong>Account deletion:</strong> to permanently delete your account and all associated
            data, contact us (see below). We will process the request within 30 days.
          </li>
        </ul>
      </Section>

      <Section title={t('sections.contact')}>
        <p>
          For questions, data deletion requests, or concerns about this policy, contact us at:{' '}
          <a
            href="https://github.com/lucasxf/engineering-daybook/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            github.com/lucasxf/engineering-daybook/issues
          </a>
        </p>
      </Section>
    </>
  );
}

function PrivacyPtBR({ t }: { t: TFn }) {
  return (
    <>
      <Section title={t('sections.intro')}>
        <p>
          learnimo é um diário de aprendizado pessoal que ajuda você a capturar, organizar e
          lembrar o que aprende. Esta política explica quais dados coletamos, como os usamos e
          quais direitos você tem sobre eles.
        </p>
        <p>
          learnimo é um projeto independente de Lucas Xavier Ferreira. Ao usar o aplicativo móvel
          ou o site do learnimo, você concorda com esta política.
        </p>
      </Section>

      <Section title={t('sections.dataCollected')}>
        <p>Coletamos apenas os dados necessários para fornecer o serviço:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Dados da conta:</strong> endereço de e-mail, nome de exibição e um identificador
            único (handle) que você escolhe.
          </li>
          <li>
            <strong>Conteúdo que você cria:</strong> títulos e textos dos aprendizados que você
            salva, etiquetas (tags) criadas e quaisquer anotações adicionadas.
          </li>
          <li>
            <strong>Dados de perfil (opcional):</strong> uma breve biografia e uma foto de perfil
            que você envia.
          </li>
          <li>
            <strong>Preferências:</strong> idioma, tema e configurações de visibilidade.
          </li>
          <li>
            <strong>Tokens de autenticação:</strong> armazenados com segurança no seu dispositivo
            para manter você conectado.
          </li>
        </ul>
        <p>Não coletamos dados de localização, identificadores de dispositivo ou análise de uso.</p>
      </Section>

      <Section title={t('sections.howWeUse')}>
        <p>Seus dados são usados exclusivamente para fornecer e melhorar o serviço learnimo:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Para autenticar você e manter sua sessão.</li>
          <li>Para armazenar e recuperar seus aprendizados.</li>
          <li>
            Para gerar sugestões de etiquetas a partir do conteúdo dos seus aprendizados usando um
            modelo de IA (o conteúdo é enviado a uma API de terceiros para processamento — veja
            abaixo).
          </li>
          <li>
            Para exibir seu perfil público e aprendizados públicos a outros usuários, se você optar
            por torná-los públicos.
          </li>
        </ul>
        <p>
          Não usamos seus dados para publicidade, criação de perfis ou qualquer finalidade que não
          seja a operação do serviço. Não vendemos seus dados a terceiros.
        </p>
      </Section>

      <Section title={t('sections.storage')}>
        <p>
          Seus dados são armazenados em um banco de dados PostgreSQL gerenciado pela{' '}
          <strong>Supabase</strong> (supabase.com). Fotos de perfil são armazenadas no Supabase
          Storage. Todos os dados são transmitidos por HTTPS.
        </p>
        <p>
          No celular, os tokens de autenticação são armazenados no chaveiro seguro do dispositivo
          usando{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
            expo-secure-store
          </code>
          . Eles nunca são gravados em armazenamento desprotegido.
        </p>
      </Section>

      <Section title={t('sections.thirdParties')}>
        <p>learnimo usa os seguintes serviços de terceiros:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Supabase</strong> — hospedagem de banco de dados e armazenamento de arquivos.
            Os dados são armazenados em sua infraestrutura gerenciada. Consulte a{' '}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Política de Privacidade da Supabase
            </a>
            .
          </li>
          <li>
            <strong>HuggingFace Inference API</strong> — usado para gerar embeddings semânticos do
            conteúdo dos seus aprendizados para alimentar a busca inteligente. O texto do conteúdo
            é enviado ao HuggingFace para processamento e não é armazenado por eles além do tempo
            de vida da requisição.
          </li>
          <li>
            <strong>Google OAuth</strong> (opcional) — se você optar por entrar com o Google, seu
            e-mail e nome da conta Google são usados para criar sua conta. Não recebemos sua senha
            do Google. Consulte a{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Política de Privacidade do Google
            </a>
            .
          </li>
        </ul>
        <p>
          Nenhum SDK de publicidade, ferramenta de análise ou serviço de relatório de falhas está
          integrado ao aplicativo.
        </p>
      </Section>

      <Section title={t('sections.yourRights')}>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Acesso e exportação:</strong> todos os seus aprendizados estão disponíveis no
            seu feed e podem ser lidos a qualquer momento.
          </li>
          <li>
            <strong>Edição e exclusão:</strong> você pode editar ou excluir qualquer aprendizado a
            qualquer momento no aplicativo ou no site.
          </li>
          <li>
            <strong>Controle de visibilidade:</strong> você decide se cada aprendizado é privado
            (somente você) ou público. Aprendizados privados nunca são visíveis para outros usuários.
          </li>
          <li>
            <strong>Exclusão de conta:</strong> para excluir permanentemente sua conta e todos os
            dados associados, entre em contato conosco (veja abaixo). Processaremos a solicitação
            em até 30 dias.
          </li>
        </ul>
      </Section>

      <Section title={t('sections.contact')}>
        <p>
          Para dúvidas, solicitações de exclusão de dados ou preocupações sobre esta política,
          entre em contato:{' '}
          <a
            href="https://github.com/lucasxf/engineering-daybook/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            github.com/lucasxf/engineering-daybook/issues
          </a>
        </p>
      </Section>
    </>
  );
}

export default function PrivacyPage() {
  return (
    <Suspense>
      <PrivacyContent />
    </Suspense>
  );
}
