/**
 * DOE+ — Home Page
 * ---------------------------------------------------------------------------
 * React Native + Expo
 *
 * Atualização de identidade visual:
 * A logo enviada revela que o produto é uma plataforma de DOAÇÃO DE SANGUE
 * ("Doar hoje é mais vida amanhã"), não uma plataforma de doações genérica.
 * A Home Page foi adaptada para essa direção:
 *   - Marca: "DOE" em vermelho escuro + "+" em vermelho vivo, com selo
 *     redondo contendo o ícone de gota, no mesmo espírito da logo.
 *   - Paleta: vermelho sangue (#7A0F16 → #E11D2E) sobre fundo branco,
 *     igual ao gradiente em onda da logo. Sem cores fora dessa família.
 *   - Conteúdo: tipos sanguíneos, bolsas coletadas, hemocentros parceiros
 *     e campanhas de doação — no lugar das categorias genéricas da versão
 *     anterior (alimentação, educação etc.), que não correspondiam à marca.
 *
 * Dependências:
 *   npx expo install expo-linear-gradient
 *   (o pacote @expo/vector-icons já vem com o Expo, não precisa instalar)
 *
 * Logo:
 *   Se preferir usar o arquivo de logo enviado em vez do selo desenhado em
 *   código, copie-o para "assets/images/doe-mais-logo.png" no projeto e
 *   troque o <LinearGradient> do header por:
 *   <Image source={require("../assets/images/doe-mais-logo.png")} style={styles.headerLogoImage} />
 *
 * Como rodar:
 *   npx expo start
 * ---------------------------------------------------------------------------
 */

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

// -----------------------------------------------------------------------------
// Design tokens — paleta extraída da logo (vermelho sangue sobre branco)
// -----------------------------------------------------------------------------
const colors = {
  maroon: "#7A0F16", // vermelho escuro do texto "DOE" na logo
  blood: "#B3161F", // vermelho médio, base dos gradientes
  bloodBright: "#E11D2E", // vermelho vivo do "+" e da onda
  bloodSoft: "#F5A3A9", // tom claro para fundos suaves e estados de baixa urgência
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#FDF3F3",
  ink: "#1A1A1A", // cor do texto da tagline na logo
  inkSoft: "#5C5C5C",
  inkFaint: "#9A9A9A",
  line: "#ECECEC",
} as const;

const spacing = { xs: 6, sm: 12, md: 20, lg: 32, xl: 48, xxl: 72 };

const type = {
  display: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia",
  }),
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
};

// Tuplas de cores exigidas pelo LinearGradient (evita erro de tipagem do TS
// com arrays genéricos "string[]")
const heroGradient = [colors.maroon, colors.blood, colors.bloodBright] as const;
const waveGradient = [colors.bloodBright, colors.blood] as const;
const markGradient = [colors.bloodBright, colors.blood] as const;
const trustGradient = [colors.maroon, colors.blood] as const;

// -----------------------------------------------------------------------------
// Dados de demonstração — NÃO representam dados reais.
// Substituir por integração de API quando o backend estiver disponível.
// -----------------------------------------------------------------------------
const IMPACT_STATS = [
  { value: "8.240", label: "bolsas de sangue coletadas" },
  { value: "24.700", label: "vidas impactadas" },
  { value: "63", label: "hemocentros parceiros" },
];

type Urgency = "alta" | "media" | "estavel";

const URGENCY_LABEL: Record<Urgency, string> = {
  alta: "Estoque crítico",
  media: "Estoque em atenção",
  estavel: "Estoque estável",
};

const BLOOD_TYPES: { label: string; urgency: Urgency }[] = [
  { label: "O−", urgency: "alta" },
  { label: "O+", urgency: "media" },
  { label: "A−", urgency: "alta" },
  { label: "A+", urgency: "estavel" },
  { label: "B−", urgency: "media" },
  { label: "B+", urgency: "estavel" },
  { label: "AB−", urgency: "alta" },
  { label: "AB+", urgency: "estavel" },
];

const FEATURED_CAMPAIGNS = [
  {
    title: "Hemocentro de Brasília — Mutirão de Inverno",
    description:
      "Reforço no estoque de tipos O− e A− para cirurgias de emergência.",
    goal: 400,
    collected: 268,
  },
  {
    title: "Hospital de Base — Campanha Contínua",
    description:
      "Doações regulares para manter o banco de sangue pediátrico abastecido.",
    goal: 250,
    collected: 91,
  },
  {
    title: "Ação Itinerante Ceilândia",
    description:
      "Coleta em unidade móvel para ampliar o acesso à doação na região.",
    goal: 180,
    collected: 152,
  },
];

const TRUST_POINTS = [
  {
    icon: "eye" as const,
    title: "Transparência de ponta a ponta",
    text: "Acompanhe para qual hemocentro sua doação foi direcionada e o estoque em tempo real.",
  },
  {
    icon: "zap" as const,
    title: "Agendar em poucos toques",
    text: "Escolha data, horário e unidade de coleta mais próxima sem burocracia.",
  },
  {
    icon: "map-pin" as const,
    title: "Conexão com hemocentros reais",
    text: "Rede de unidades credenciadas perto de você, com endereço e horário atualizados.",
  },
  {
    icon: "shield" as const,
    title: "Segurança em cada etapa",
    text: "Triagem clínica, dados protegidos e protocolo seguido do agendamento à coleta.",
  },
];

function formatUnits(value: number) {
  return `${value} bolsas`;
}

function urgencyChipStyle(urgency: Urgency) {
  if (urgency === "alta") return { backgroundColor: colors.bloodBright };
  if (urgency === "media") return { backgroundColor: colors.blood };
  return { backgroundColor: colors.bloodSoft };
}

function urgencyTextStyle(urgency: Urgency) {
  return urgency === "estavel"
    ? { color: colors.maroon }
    : { color: colors.surface };
}

// -----------------------------------------------------------------------------
// Componentes reutilizáveis
// -----------------------------------------------------------------------------

function PrimaryButton({
  label,
  onPress,
  compact = false,
}: {
  label: string;
  onPress?: () => void;
  compact?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <View
          style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
        >
          <Text style={styles.primaryButtonText}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SectionHeading({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, light && { color: colors.surface }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, light && { color: "#FBDADC" }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerBrand}>
        <LinearGradient colors={markGradient} style={styles.headerMark}>
          <Feather name="droplet" size={14} color={colors.surface} />
        </LinearGradient>
        <Text style={styles.headerWordmark}>
          DOE<Text style={styles.headerWordmarkPlus}>+</Text>
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/login")}
        style={({ pressed }) => [
          styles.headerAction,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Feather name="user" size={16} color={colors.ink} />
        <Text style={styles.headerActionText}>Entrar</Text>
      </Pressable>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------

function Hero() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={heroGradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.hero}
    >
      {/* onda decorativa inspirada na base da logo */}
      <LinearGradient
        colors={waveGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={styles.heroWave}
      />
      <View style={[styles.heroBlob, styles.heroBlobOne]} />

      <View style={styles.heroContent}>
        <Text style={styles.heroKicker}>
          DOE+ · doação de sangue com propósito
        </Text>
        <Text style={styles.heroTitle}>Doar hoje é mais vida amanhã.</Text>
        <Text style={styles.heroSubtitle}>
          O DOE+ conecta doadores a hemocentros e campanhas que precisam de
          sangue com urgência — com agendamento simples e total transparência
          sobre o destino da sua doação.
        </Text>

        <View style={styles.heroActions}>
          <PrimaryButton label="Agendar doação" onPress={() => router.push("/login")} />
          <SecondaryButton label="Conhecer a plataforma" />
        </View>
      </View>
    </LinearGradient>
  );
}

// -----------------------------------------------------------------------------
// Impacto
// -----------------------------------------------------------------------------

function ImpactSection() {
  return (
    <View style={styles.impactSection}>
      <SectionHeading
        title="O impacto de doar em conjunto"
        subtitle="Números demonstrativos — a plataforma exibirá dados reais quando integrada ao backend."
      />
      <View style={styles.impactRow}>
        {IMPACT_STATS.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{stat.value}</Text>
              <Text style={styles.impactLabel}>{stat.label}</Text>
            </View>
            {i < IMPACT_STATS.length - 1 && (
              <View style={styles.impactDivider} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Tipos sanguíneos em falta
// -----------------------------------------------------------------------------

function BloodTypesSection() {
  return (
    <View style={styles.section}>
      <SectionHeading
        title="Tipos sanguíneos em falta"
        subtitle="Situação demonstrativa do estoque por tipo — atualizada em tempo real quando conectada ao backend."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {BLOOD_TYPES.map((bloodType) => (
          <Pressable
            key={bloodType.label}
            style={({ pressed }) => [
              styles.categoryChip,
              pressed && { opacity: 0.75 },
            ]}
          >
            <View
              style={[
                styles.categoryIconWrap,
                urgencyChipStyle(bloodType.urgency),
              ]}
            >
              <Text
                style={[
                  styles.categoryTypeText,
                  urgencyTextStyle(bloodType.urgency),
                ]}
              >
                {bloodType.label}
              </Text>
            </View>
            <Text style={styles.categoryLabel}>
              {URGENCY_LABEL[bloodType.urgency]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Campanhas em destaque
// -----------------------------------------------------------------------------

function CampaignCard({
  campaign,
}: {
  campaign: (typeof FEATURED_CAMPAIGNS)[number];
}) {
  const progress = Math.min(1, campaign.collected / campaign.goal);

  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignImagePlaceholder}>
        <Feather name="droplet" size={22} color={colors.bloodBright} />
      </View>
      <Text style={styles.campaignTitle}>{campaign.title}</Text>
      <Text style={styles.campaignDescription}>{campaign.description}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: colors.bloodBright,
            },
          ]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressRaised}>
          {formatUnits(campaign.collected)} coletadas
        </Text>
        <Text style={styles.progressGoal}>
          meta de {formatUnits(campaign.goal)}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.learnMoreButton,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.learnMoreText}>Saiba mais</Text>
      </Pressable>
    </View>
  );
}

function CampaignsSection() {
  return (
    <View style={styles.section}>
      <SectionHeading
        title="Campanhas em destaque"
        subtitle="Campanhas de exemplo — conteúdo real será carregado a partir da API do projeto."
      />
      <View style={styles.campaignsGrid}>
        {FEATURED_CAMPAIGNS.map((campaign) => (
          <CampaignCard key={campaign.title} campaign={campaign} />
        ))}
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Confiança
// -----------------------------------------------------------------------------

function TrustSection() {
  return (
    <LinearGradient
      colors={trustGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.trustSection}
    >
      <SectionHeading
        title="Por que doar pelo DOE+"
        subtitle="Cada detalhe da plataforma foi pensado para que sua doação chegue com confiança."
        light
      />
      <View style={styles.trustGrid}>
        {TRUST_POINTS.map((point) => (
          <View key={point.title} style={styles.trustCard}>
            <View style={styles.trustIconWrap}>
              <Feather name={point.icon} size={18} color={colors.surface} />
            </View>
            <Text style={styles.trustTitle}>{point.title}</Text>
            <Text style={styles.trustText}>{point.text}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerBrand}>
        <LinearGradient colors={markGradient} style={styles.footerMark}>
          <Feather name="droplet" size={12} color={colors.surface} />
        </LinearGradient>
        <Text style={styles.footerWordmark}>
          DOE<Text style={styles.headerWordmarkPlus}>+</Text>
        </Text>
      </View>
      <Text style={styles.footerText}>
        Plataforma que conecta doadores de sangue a hemocentros e campanhas —
        com transparência do agendamento à coleta.
      </Text>

      <View style={styles.footerLinks}>
        {["Sobre", "Hemocentros parceiros", "Segurança", "Fale conosco"].map(
          (link) => (
            <Pressable
              key={link}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Text style={styles.footerLink}>{link}</Text>
            </Pressable>
          ),
        )}
      </View>

      <View style={styles.footerDivider} />
      <Text style={styles.footerMeta}>
        DOE+ · Conteúdo institucional demonstrativo · CNPJ 00.000.000/0001-00
      </Text>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Home
// -----------------------------------------------------------------------------

export default function Home() {
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <Hero />
        <ImpactSection />
        <BloodTypesSection />
        <CampaignsSection />
        <TrustSection />
        <Footer />
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  headerMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  headerLogoImage: {
    width: 28,
    height: 28,
    borderRadius: 9,
    marginRight: spacing.xs,
  },
  headerWordmark: {
    fontFamily: type.display,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.maroon,
  },
  headerWordmarkPlus: { color: colors.bloodBright },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  headerActionText: {
    fontFamily: type.body,
    fontSize: 14,
    color: colors.ink,
    fontWeight: "500",
  },

  // Hero
  hero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
    position: "relative",
  },
  heroWave: {
    position: "absolute",
    bottom: -40,
    left: -SCREEN_W * 0.2,
    width: SCREEN_W * 1.6,
    height: SCREEN_W * 0.9,
    borderRadius: SCREEN_W,
    opacity: 0.35,
    transform: [{ rotate: "-8deg" }],
  },
  heroBlob: { position: "absolute", borderRadius: 400 },
  heroBlobOne: {
    width: SCREEN_W * 0.7,
    height: SCREEN_W * 0.7,
    backgroundColor: colors.surface,
    top: -SCREEN_W * 0.45,
    right: -SCREEN_W * 0.3,
    opacity: 0.08,
  },
  heroContent: { maxWidth: 560 },
  heroKicker: {
    fontFamily: type.body,
    fontSize: 13,
    color: "#FBDADC",
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontFamily: type.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.surface,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    fontFamily: type.body,
    fontSize: 16,
    lineHeight: 24,
    color: "#FBDADC",
    marginBottom: spacing.lg,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center",
  },

  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  primaryButtonCompact: { paddingVertical: 10, paddingHorizontal: 18 },
  primaryButtonText: {
    fontFamily: type.body,
    color: colors.blood,
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  secondaryButtonText: {
    fontFamily: type.body,
    color: colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },

  // Sections (shared)
  section: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  sectionHeading: { marginBottom: spacing.lg, maxWidth: 520 },
  sectionTitle: {
    fontFamily: type.display,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontFamily: type.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },

  // Impact
  impactSection: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  impactItem: { flex: 1, alignItems: "center" },
  impactValue: { fontFamily: type.display, fontSize: 22, color: colors.maroon },
  impactLabel: {
    fontFamily: type.body,
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 4,
    textAlign: "center",
  },
  impactDivider: {
    width: StyleSheet.hairlineWidth,
    height: "70%",
    backgroundColor: colors.line,
  },

  // Blood types
  categoryRow: { gap: spacing.sm, paddingRight: spacing.md },
  categoryChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minWidth: 108,
    borderWidth: 1,
    borderColor: colors.line,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  categoryTypeText: {
    fontFamily: type.display,
    fontSize: 16,
    fontWeight: "700",
  },
  categoryLabel: {
    fontFamily: type.body,
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkSoft,
    textAlign: "center",
  },

  // Campaigns
  campaignsGrid: { gap: spacing.md },
  campaignCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  campaignImagePlaceholder: {
    height: 120,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  campaignTitle: {
    fontFamily: type.display,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 6,
  },
  campaignDescription: {
    fontFamily: type.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  progressRaised: {
    fontFamily: type.body,
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  progressGoal: { fontFamily: type.body, fontSize: 12, color: colors.inkFaint },
  learnMoreButton: { alignSelf: "flex-start" },
  learnMoreText: {
    fontFamily: type.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.bloodBright,
  },

  // Trust
  trustSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  trustGrid: { gap: spacing.md },
  trustCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  trustTitle: {
    fontFamily: type.display,
    fontSize: 16,
    color: colors.surface,
    marginBottom: 4,
  },
  trustText: {
    fontFamily: type.body,
    fontSize: 13,
    lineHeight: 19,
    color: "#FBDADC",
  },

  // Footer
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  footerMark: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  footerWordmark: {
    fontFamily: type.display,
    fontSize: 17,
    color: colors.maroon,
  },
  footerText: {
    fontFamily: type.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    maxWidth: 420,
    marginBottom: spacing.md,
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  footerLink: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.ink,
    fontWeight: "600",
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginBottom: spacing.sm,
  },
  footerMeta: { fontFamily: type.body, fontSize: 11, color: colors.inkFaint },
});
