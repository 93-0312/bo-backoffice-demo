import { useState, type ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Textarea,
  Checkbox,
  Field,
  Label,
  Meter,
  Badge,
  Avatar,
  AvatarGroup,
  InputOTP,
  Select,
  Switch,
  SegmentedControl,
  RadioGroup,
  RadioGroupItem,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  NumberField,
  Spinner,
  Skeleton,
  Alert,
  Tooltip,
  Separator,
  Breadcrumb,
  Accordion,
  AccordionItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  ConfirmDialog,
  Toast,
  IconBell,
  IconCheck,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/shared/ui";
import { getInitials } from "@/shared/lib";
import { useTheme, type Theme } from "@/shared/theme";
import { __resetUsers } from "@/entities/user";
import { __resetOrders } from "@/entities/order";
import { PageHeader } from "@/widgets/page-header";

/**
 * SettingsPage — 라우트 `/settings` (page).
 *
 * 두 역할:
 *  1) 환경 설정(테마, 데모 데이터 리셋)
 *  2) "교보재" 컴포넌트 갤러리 — shared 레이어(bo-ui-kit + app-shared)의 컴포넌트를
 *     변형/상태별로 한 화면에 모아 보여준다(디자인 시스템 카탈로그).
 */
export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  function resetData() {
    __resetUsers();
    __resetOrders();
    setResetMsg(
      "데모 데이터를 초기화했습니다. 각 페이지를 새로고침하면 반영됩니다.",
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="설정"
        description="환경 설정과 디자인 시스템 카탈로그(교보재)."
      />

      {/* 1) 환경 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>환경 설정</CardTitle>
          <CardDescription>테마와 데모 데이터를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="테마">
            <SegmentedControl
              options={[
                { value: "light", label: "라이트" },
                { value: "dark", label: "다크" },
              ]}
              value={theme}
              onValueChange={(v) => setTheme(v as Theme)}
              className="w-56"
            />
          </Field>
          <div className="flex flex-col items-start gap-2">
            <Button variant="destructive-tinted" size="sm" onClick={resetData}>
              데모 데이터 초기화
            </Button>
            {resetMsg && (
              <Alert type="success" title={resetMsg} className="max-w-xl" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2) 컴포넌트 갤러리 — 아래는 전부 bo-ui-kit 컴포넌트 */}
      <Section
        title="오버레이 · 모달"
        desc="버튼을 눌러 직접 띄워보세요 (Dialog · AlertDialog · Sheet · Drawer · Toast)"
      >
        <OverlayShowcase />
      </Section>

      <Section title="Button" desc="variant × size × pill">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="destructive-tinted">Destructive Tinted</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">xs</Button>
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button size="xl">xl</Button>
          <Button pill>pill</Button>
          <Button icon={<IconCheck />}>icon</Button>
          <Button disabled>disabled</Button>
        </div>
      </Section>

      <Section title="Badge" desc="color × variant(fill/tinted)">
        <div className="flex flex-wrap items-center gap-2">
          {(
            ["neutral", "info", "success", "warning", "destructive"] as const
          ).map((c) => (
            <Badge key={c} color={c} variant="fill">
              {c}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(
            ["neutral", "info", "success", "warning", "destructive"] as const
          ).map((c) => (
            <Badge key={c} color={c} variant="tinted">
              {c}
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        title="Avatar · AvatarGroup"
        desc="이미지 폴백(이니셜) + 겹침 그룹"
      >
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={getInitials("김하늘")} alt="김하늘" />
          <Avatar size="md" fallback={getInitials("이도현")} alt="이도현" />
          <Avatar
            size="lg"
            shape="square"
            fallback={getInitials("박서연")}
            alt="박서연"
          />
          <AvatarGroup size="md" max={3}>
            <Avatar fallback={getInitials("김하늘")} alt="김하늘" />
            <Avatar fallback={getInitials("이도현")} alt="이도현" />
            <Avatar fallback={getInitials("박서연")} alt="박서연" />
            <Avatar fallback={getInitials("정우진")} alt="정우진" />
            <Avatar fallback={getInitials("한지호")} alt="한지호" />
          </AvatarGroup>
        </div>
      </Section>

      <Section title="Select · Tabs · SegmentedControl">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            className="w-48"
            placeholder="국가 선택"
            options={[
              { value: "kr", label: "대한민국" },
              { value: "us", label: "United States" },
              { value: "jp", label: "日本" },
            ]}
            defaultValue="kr"
          />
          <SegmentedControl
            className="w-56"
            options={[
              { value: "day", label: "일" },
              { value: "week", label: "주" },
              { value: "month", label: "월" },
            ]}
            defaultValue="week"
          />
        </div>
        <Tabs defaultValue="overview" className="max-w-md">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="activity">활동</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="pt-3 text-sm text-muted-foreground"
          >
            개요 탭 내용입니다.
          </TabsContent>
          <TabsContent
            value="activity"
            className="pt-3 text-sm text-muted-foreground"
          >
            활동 탭 내용입니다.
          </TabsContent>
          <TabsContent
            value="security"
            className="pt-3 text-sm text-muted-foreground"
          >
            보안 탭 내용입니다.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="선택 컨트롤" desc="Checkbox · Switch · Radio · Toggle">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            <Label>체크박스(선택됨)</Label>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox indeterminate checked readOnly />
            <Label>부분 선택(indeterminate)</Label>
          </label>
          <div className="flex items-center gap-2">
            <Switch defaultChecked />
            <Label>스위치</Label>
          </div>
          <RadioGroup defaultValue="b" className="flex flex-col gap-2">
            <RadioGroupItem value="a" title="옵션 A" />
            <RadioGroupItem
              value="b"
              title="옵션 B"
              description="설명이 있는 라디오"
            />
            <RadioGroupItem value="c" title="옵션 C" disabled />
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Toggle defaultPressed>토글</Toggle>
            <Toggle variant="outline" iconOnly aria-label="알림">
              <IconBell />
            </Toggle>
            <ToggleGroup type="single" defaultValue="left">
              <ToggleGroupItem value="left">왼쪽</ToggleGroupItem>
              <ToggleGroupItem value="center">가운데</ToggleGroupItem>
              <ToggleGroupItem value="right">오른쪽</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Section>

      <Section
        title="입력"
        desc="Input · Field · Textarea · NumberField · InputOTP"
      >
        <div className="grid max-w-md gap-4">
          <Field label="이름" htmlFor="g-name" description="공백 포함 2~20자">
            <Input id="g-name" placeholder="홍길동" />
          </Field>
          <Field
            label="이메일"
            htmlFor="g-email"
            required
            error="이미 사용 중인 이메일입니다."
          >
            <Input id="g-email" invalid defaultValue="taken@example.com" />
          </Field>
          <Field label="메모" htmlFor="g-memo">
            <Textarea id="g-memo" placeholder="여러 줄 입력" />
          </Field>
          <Field label="수량" htmlFor="g-qty">
            <NumberField id="g-qty" defaultValue={1} min={0} max={99} />
          </Field>
          <Field label="인증코드">
            <InputOTP showTitle={false} showBelowText={false}>
              <InputOTPSlot />
              <InputOTPSlot />
              <InputOTPSlot />
              <InputOTPSeparator />
              <InputOTPSlot />
              <InputOTPSlot />
              <InputOTPSlot />
            </InputOTP>
          </Field>
        </div>
      </Section>

      <Section title="피드백" desc="Alert · Spinner · Skeleton · Meter">
        <div className="flex flex-col gap-3">
          <Alert type="info" title="정보">
            업데이트가 예정되어 있습니다.
          </Alert>
          <Alert type="success" title="저장됨">
            변경 사항이 반영되었습니다.
          </Alert>
          <Alert type="warning" title="주의">
            곧 만료되는 항목이 있습니다.
          </Alert>
          <Alert type="error" title="오류">
            요청을 처리하지 못했습니다.
          </Alert>
          <div className="flex items-center gap-3">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Skeleton className="h-9 w-40 rounded-radius" />
          </div>
          <div className="grid max-w-md gap-3">
            <Meter label="낮음" value={24} showLabels showSecondaryLabel />
            <Meter label="높음" value={91} showLabels showSecondaryLabel />
          </div>
        </div>
      </Section>

      <Section
        title="탐색 · 구획"
        desc="Breadcrumb · Tooltip · Separator · Accordion"
      >
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            { label: "설정", href: "/settings" },
            { label: "디자인 시스템" },
          ]}
        />
        <div className="flex items-center gap-3">
          <Tooltip content="도움말 텍스트">
            <Button variant="outline" size="sm">
              hover 해보세요
            </Button>
          </Tooltip>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">
            구분선 옆 텍스트
          </span>
        </div>
        <Accordion type="single" defaultValue="q1" className="max-w-md">
          <AccordionItem value="q1" title="FSD 란 무엇인가요?">
            위에서 아래로만 참조하는 6층 폴더 규칙입니다.
          </AccordionItem>
          <AccordionItem value="q2" title="bo-ui-kit 은 어느 계층인가요?">
            shared 레이어입니다. 이 갤러리의 컴포넌트가 전부 그 예시입니다.
          </AccordionItem>
        </Accordion>
      </Section>
    </div>
  );
}

/**
 * OverlayShowcase — 포털로 띄우는 오버레이 컴포넌트들의 인터랙티브 데모.
 * 각 버튼이 해당 오버레이를 열고, 자체 open 상태를 관리한다(킷 컴포넌트는 모두 제어형 지원).
 */
function OverlayShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  function flashToast() {
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 2800);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          Dialog 열기
        </Button>
        <Button variant="outline" onClick={() => setAlertOpen(true)}>
          AlertDialog 열기
        </Button>
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          ConfirmDialog 열기
        </Button>
        <Button variant="outline" onClick={() => setSheetOpen(true)}>
          Sheet 열기(우측)
        </Button>
        <Button variant="outline" onClick={() => setDrawerOpen(true)}>
          Drawer 열기(하단)
        </Button>
        <Button variant="outline" onClick={flashToast}>
          Toast 띄우기
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>다이얼로그 예시</DialogTitle>
            <DialogDescription>
              백드롭 클릭 · ESC · X 로 닫힙니다. 폼/확인 등 일반 모달에 씁니다.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              여기에 임의의 내용을 넣을 수 있습니다.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              닫기
            </Button>
            <Button onClick={() => setDialogOpen(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog (확인 전용) */}
      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        destructive
        title="정말 삭제할까요?"
        description="이 작업은 되돌릴 수 없습니다. 명시적으로 선택해야 닫힙니다(바깥 클릭 무시)."
        cancelText="취소"
        actionText="삭제"
        onAction={() => setAlertOpen(false)}
      />

      {/* ConfirmDialog (app-shared: Dialog 껍데기를 감싼 확인창) */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="변경사항을 저장할까요?"
        description="제목/메시지만 props 로 바꿔 재사용하는 공통 확인창입니다."
        confirmLabel="저장"
        onConfirm={() => console.log("[confirm] 저장")}
      />

      {/* Sheet (우측 패널) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>사이드 시트</SheetTitle>
            <SheetDescription>
              화면 가장자리에서 슬라이드되는 패널입니다.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 text-sm text-muted-foreground">
            상세 보기, 필터, 폼 등 보조 콘텐츠를 담기 좋습니다.
          </div>
          <SheetFooter>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>
              닫기
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Drawer (하단 패널) */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerHeader>
          <DrawerTitle>드로어</DrawerTitle>
          <DrawerDescription>
            Sheet 기반의 하단 플로팅 패널입니다.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 text-sm text-muted-foreground">
          모바일 친화적인 하단 시트.
        </div>
      </Drawer>

      {/* Toast (플로팅 알림) */}
      {toastOpen && (
        <div className="fixed bottom-5 right-5 z-[100] w-80">
          <Toast type="success" title="저장되었습니다">
            변경 사항이 반영되었습니다.
          </Toast>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {desc && <CardDescription>{desc}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
