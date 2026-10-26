"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { BookOpenText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { messages, t } from "@/lib/i18n";
import {
  TUTORIAL_IMAGES,
  getCachedSrc,
  preloadAllTutorialImages,
} from "@/lib/tutorialImages";
import { cn } from "@/lib/utils";

const copy = messages.analyzer.exportTutorial;
const steps = copy.steps;

const TUTORIAL_LINK_CLASS =
  "font-medium text-[var(--brand)] underline decoration-[color-mix(in_srgb,var(--brand)_55%,transparent)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text)] hover:decoration-[var(--brand)]";

const gradientButtonStyles = { root: { color: "var(--brand-contrast)" } };

function stepIndexFromNumber(stepNumber: number): number {
  return stepNumber - 1;
}

export function InstagramExportTutorial() {
  const [opened, setOpened] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    preloadAllTutorialImages();
  }, []);

  const open = useCallback(() => {
    setStep(0);
    setOpened(true);
  }, []);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  useEffect(() => {
    if (!opened) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStep((s) => Math.min(steps.length - 1, s + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [opened]);

  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const current = steps[step];
  const image = TUTORIAL_IMAGES[step];
  const quickStart = "quickStart" in current ? current.quickStart : null;

  return (
    <>
      <UnstyledButton
        type="button"
        onClick={open}
        className={TUTORIAL_LINK_CLASS}
        data-tour="export-tutorial"
      >
        <BookOpenText className="mr-1 inline-block size-4 align-text-bottom" />
        {copy.trigger}
      </UnstyledButton>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        padding={0}
        size="xl"
        radius="lg"
        centered
        aria-labelledby="export-tutorial-title"
        overlayProps={{ backgroundOpacity: 1, color: "#0b1224" }}
        styles={{
          content: {
            maxHeight: "min(90vh, 56rem)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
          body: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            padding: 0,
          },
        }}
      >
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="sm"
          className="surface-card-header shrink-0 px-5 py-3.5"
        >
          <Box className="min-w-0">
            <Text size="xs" fw={500} className="tabular-nums text-tertiary-readable">
              {t(copy.stepOf, { current: step + 1, total: steps.length })}
            </Text>
            <Text
              id="export-tutorial-title"
              component="h2"
              fw={600}
              mt={4}
              className="text-base leading-snug text-[var(--text)]"
            >
              {current.title}
            </Text>
          </Box>
          <ActionIcon
            type="button"
            variant="transparent"
            className="icon-button shrink-0"
            aria-label={copy.close}
            onClick={close}
          >
            <X className="size-4" />
          </ActionIcon>
        </Group>

        <Box className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Stack key={step} gap="md" className="px-5 py-4">
            {quickStart ? (
              <Box className="surface-inset space-y-2 px-3.5 py-3">
                <Text size="sm" lh={1.6} className="text-secondary-readable">
                  {quickStart.startPrefix}{" "}
                  <a
                    href={quickStart.startLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={TUTORIAL_LINK_CLASS}
                  >
                    {quickStart.startLink.label}
                  </a>
                </Text>
                <a
                  href={quickStart.skipLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(TUTORIAL_LINK_CLASS, "block text-sm")}
                  onClick={() => setStep(stepIndexFromNumber(quickStart.skipToStep))}
                >
                  {quickStart.skipLink.label}
                </a>
              </Box>
            ) : null}

            <Box>
              <Text
                size="sm"
                lh={1.6}
                className="text-secondary-readable"
                dangerouslySetInnerHTML={{ __html: current.description }}
              />
              {"shortcut" in current && current.shortcut ? (
                <Text size="sm" mt="xs">
                  <a
                    href={current.shortcut.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={TUTORIAL_LINK_CLASS}
                  >
                    {current.shortcut.label}
                  </a>
                </Text>
              ) : null}
            </Box>

            <Box className="surface-inset flex justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={image.src}
                src={getCachedSrc(image.src)}
                alt={current.title}
                width={image.width}
                height={image.height}
                decoding="async"
                className="block h-auto w-auto max-w-full rounded-lg"
                style={{
                  maxWidth: `min(100%, ${image.width}px)`,
                  maxHeight: `min(52vh, ${image.height}px)`,
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Group
          justify="center"
          gap={6}
          className="shrink-0 border-t border-[var(--line)] px-5 py-2.5"
          role="tablist"
          aria-label={copy.stepDotsLabel}
        >
          {steps.map((_, i) => (
            <UnstyledButton
              key={i}
              type="button"
              role="tab"
              aria-label={t(copy.goToStep, { step: i + 1 })}
              aria-selected={i === step}
              className={cn(
                "h-2 rounded-full transition-all duration-200 [transition-timing-function:var(--ease-out-expo)]",
                i === step
                  ? "w-5 bg-[var(--brand)]"
                  : "w-2 bg-[var(--line-strong)] hover:bg-[var(--brand-2)]",
              )}
              onClick={() => setStep(i)}
            />
          ))}
        </Group>

        <Group
          justify="space-between"
          wrap="nowrap"
          className="shrink-0 border-t border-[var(--line)] px-5 py-3"
        >
          <Button
            type="button"
            variant="outline"
            color="gray"
            size="xs"
            leftSection={<ChevronLeft className="size-4" />}
            disabled={isFirst}
            onClick={() => setStep((s) => s - 1)}
          >
            {copy.previous}
          </Button>
          {isLast ? (
            <Button
              type="button"
              variant="gradient"
              size="xs"
              styles={gradientButtonStyles}
              onClick={close}
            >
              {copy.finish}
            </Button>
          ) : (
            <Button
              type="button"
              variant="gradient"
              size="xs"
              styles={gradientButtonStyles}
              rightSection={<ChevronRight className="size-4" />}
              onClick={() => setStep((s) => s + 1)}
            >
              {copy.next}
            </Button>
          )}
        </Group>
      </Modal>
    </>
  );
}
