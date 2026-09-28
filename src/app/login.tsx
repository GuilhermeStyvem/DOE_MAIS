/**
 * DOE+ — Login
 * ---------------------------------------------------------------------------
 * src/app/login.tsx — React Native + Expo Router
 *
 * Refatoração:
 *   - react-hook-form + zod substituem os múltiplos useState/if em cascata.
 *   - Senha exige 8+ caracteres, 1 maiúscula e 1 número.
 *   - KeyboardAvoidingView com keyboardVerticalOffset dedicado ao Android.
 *   - Campos com aria-invalid e mensagem de erro anunciada para leitores de tela.
 *   - Estado isLoading desativa o botão durante a submissão (mock assíncrono).
 *
 * Dependências novas:
 *   npm install react-hook-form zod @hookform/resolvers
 *
 * Ainda sem backend: handleLogin() só simula a submissão e faz log dos
 * dados sanitizados (a senha nunca é logada). O ponto de integração real
 * está marcado com TODO.
 * ---------------------------------------------------------------------------
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Design tokens — mesma paleta da Home e do Cadastro
// -----------------------------------------------------------------------------
const colors = {
  maroon: "#7A0F16",
  blood: "#B3161F",
  bloodBright: "#E11D2E",
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  ink: "#1A1A1A",
  inkSoft: "#5C5C5C",
  inkFaint: "#9A9A9A",
  line: "#ECECEC",
} as const;

const spacing = { xs: 6, sm: 12, md: 20, lg: 32, xl: 48 };

const type = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
};

const markGradient = [colors.bloodBright, colors.blood] as const;
const topGradient = [colors.maroon, colors.blood, colors.bloodBright] as const;

// -----------------------------------------------------------------------------
// Schema de validação
// -----------------------------------------------------------------------------
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "A senha precisa de pelo menos uma letra maiúscula.")
    .regex(/[0-9]/, "A senha precisa de pelo menos um número."),
});

type LoginFormData = z.infer<typeof loginSchema>;

// -----------------------------------------------------------------------------
// Botão primário
// -----------------------------------------------------------------------------
function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() =>
        !isDisabled &&
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
      }
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [{ opacity: pressed || isDisabled ? 0.75 : 1 }]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={markGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>{label}</Text>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// -----------------------------------------------------------------------------
// Campo de formulário controlado por react-hook-form
// -----------------------------------------------------------------------------
function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secure = false,
  icon,
  keyboardType = "default",
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  placeholder: string;
  secure?: boolean;
  icon: keyof typeof Feather.glyphMap;
  keyboardType?: "default" | "email-address";
  error?: string;
}) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const errorId = `${label}-error`;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel} nativeID={`${label}-label`}>
        {label}
      </Text>
      <View
        style={[
          styles.fieldInputWrap,
          focused && styles.fieldInputWrapFocused,
          hasError && styles.fieldInputWrapError,
        ]}
      >
        <Feather name={icon} size={16} color={colors.inkFaint} style={styles.fieldIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={styles.fieldInput}
          accessibilityLabel={hasError ? `${label}. Erro: ${error}` : label}
          // Suportado nativamente pelo React Native (aliases aria-*)
          aria-invalid={hasError}
          aria-required
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Esconder senha"}
          >
            <Feather name={hidden ? "eye" : "eye-off"} size={16} color={colors.inkFaint} />
          </Pressable>
        )}
      </View>
      {hasError ? (
        <Text style={styles.fieldError} nativeID={errorId} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Mock de submissão — troque pelo fetch/axios real quando o backend existir
// -----------------------------------------------------------------------------
async function mockSubmitLogin(data: LoginFormData): Promise<void> {
  // TODO: substituir por chamada real (ex: FastAPI + JWT).
  // fetch("https://sua-api.com/auth/login", { method: "POST", body: JSON.stringify(data) })
  const dadosHigienizados = {
    email: data.email.trim().toLowerCase(),
    senha: "••••••••", // a senha nunca é logada, nem mascarada com o tamanho real
  };
  await new Promise((resolve) => setTimeout(resolve, 900));
  // eslint-disable-next-line no-console
  console.log("[DOE+] login submetido (mock):", dadosHigienizados);
}

// -----------------------------------------------------------------------------
// Tela de Login
// -----------------------------------------------------------------------------

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
    mode: "onBlur",
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setFeedback(null);
    try {
      await mockSubmitLogin(data);
      setFeedback("Dados válidos. A autenticação será conectada em breve.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 80 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={topGradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.top}>
          <LinearGradient colors={markGradient} style={styles.mark}>
            <Feather name="droplet" size={20} color={colors.surface} />
          </LinearGradient>
          <Text style={styles.brandText}>
            DOE<Text style={{ color: colors.bloodBright }}>+</Text>
          </Text>
          <Text style={styles.topTitle}>Bem-vindo de volta</Text>
          <Text style={styles.topSubtitle}>Entre na sua conta para continuar.</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="E-mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="voce@email.com"
                icon="mail"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Sua senha"
                icon="lock"
                secure
                error={errors.senha?.message}
              />
            )}
          />

          {feedback ? (
            <Text style={styles.feedbackText} accessibilityRole="alert">
              {feedback}
            </Text>
          ) : null}

          <Pressable
            style={styles.forgotLink}
            accessibilityRole="button"
            accessibilityLabel="Esqueci minha senha"
          >
            <Text style={styles.forgotLinkText}>Esqueci minha senha</Text>
          </Pressable>

          <PrimaryButton label="Entrar" onPress={handleSubmit(onSubmit)} loading={isLoading} />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Não possui uma conta? </Text>
            <Link href="/cadastro" asChild>
              <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Cadastre-se">
                <Text style={styles.signupLink}>Cadastre-se</Text>
              </Pressable>
            </Link>
          </View>

          <Pressable
            onPress={() => router.replace("/")}
            style={styles.backLink}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o início"
          >
            <Feather name="arrow-left" size={14} color={colors.inkSoft} />
            <Text style={styles.backLinkText}>Voltar para o início</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------------------------------------------------------
// Estilos
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xl },

  top: {
    paddingTop: Platform.OS === "ios" ? 88 : 64,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  brandText: {
    fontFamily: type.display,
    fontSize: 20,
    fontWeight: "700",
    color: colors.surface,
    marginBottom: spacing.md,
  },
  topTitle: {
    fontFamily: type.display,
    fontSize: 24,
    color: colors.surface,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  topSubtitle: {
    fontFamily: type.body,
    fontSize: 14,
    color: "#FBDADC",
    textAlign: "center",
  },

  form: { paddingHorizontal: spacing.md, paddingTop: spacing.xl, maxWidth: 440, width: "100%", alignSelf: "center" },

  field: { marginBottom: spacing.md },
  fieldLabel: { fontFamily: type.body, fontSize: 13, fontWeight: "600", color: colors.ink, marginBottom: spacing.xs },
  fieldInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === "ios" ? 12 : 4,
    gap: spacing.xs,
  },
  fieldInputWrapFocused: { borderColor: colors.bloodBright },
  fieldInputWrapError: { borderColor: colors.bloodBright, backgroundColor: "#FDF3F3" },
  fieldIcon: { marginRight: 2 },
  fieldInput: { flex: 1, fontFamily: type.body, fontSize: 15, color: colors.ink, paddingVertical: 8 },
  fieldError: { fontFamily: type.body, fontSize: 12, color: colors.bloodBright, marginTop: 4 },

  feedbackText: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.blood,
    backgroundColor: "#FDF3F3",
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.md,
  },

  forgotLink: { alignSelf: "flex-end", marginBottom: spacing.lg },
  forgotLinkText: { fontFamily: type.body, fontSize: 13, fontWeight: "600", color: colors.blood },

  primaryButton: { paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { fontFamily: type.body, color: colors.surface, fontSize: 15, fontWeight: "700" },

  signupRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginTop: spacing.lg },
  signupText: { fontFamily: type.body, fontSize: 14, color: colors.inkSoft },
  signupLink: { fontFamily: type.body, fontSize: 14, fontWeight: "700", color: colors.bloodBright },

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xl,
  },
  backLinkText: { fontFamily: type.body, fontSize: 13, color: colors.inkSoft },
});
