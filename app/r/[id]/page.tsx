import { Divider } from "@nextui-org/divider";
import { Chip } from "@nextui-org/chip";
import { ClockIcon } from "@primer/octicons-react";
import { notFound } from "next/navigation";
import { TestResult } from "lc3xt/src/nya/context";
import { Link } from "@nextui-org/link";

import CopyCode from "@/components/copy-code";
import BenchUnits from "@/components/bench-units";
import CodeBlock from "@/components/code-block";
import { RefreshButton } from "@/components/refresh-button";
import { labContents } from "@/components/labs";
import OwnerChip from "@/components/owner-chip";
import { siteConfig } from "@/config/site";
import { ExceptionList } from "@/components/exception-list";
import SACSummary from "@/app/r/[id]/sac-summary";

export default async function RecordPage({
  params,
}: {
  params: { id: string };
}) {
  const latestVersion = await (
    await fetch(siteConfig.benchAPI + "/version", { cache: "no-cache" })
  ).text();

  const res = await fetch(siteConfig.benchAPI + `/record/${params.id}`);

  if (res.status === 404) {
    return notFound();
  }

  const pending = res.status === 202;

  if (pending) {
    return (
      <div className="flex flex-col gap-4 w-full h-full justify-center items-center">
        <ClockIcon size={32} />
        <p className="text-lg font-bold">评测进行中，请稍等。</p>
        <RefreshButton />
      </div>
    );
  }

  const testResult = (await res.json()) as TestResult;

  const isLatest = testResult.runnerVersion === latestVersion;

  const benchedTime = getCompletedTime(testResult);
  const passed =
    testResult.units.length > 0 &&
    testResult.units.every((u) => u.status === "AC");
  const totalCount = testResult.units.length;
  const passedCount = testResult.units.filter((u) => u.status === "AC").length;

  const sortedSACReport = testResult.sac.concat();

  sortedSACReport.sort((a, b) => b.confidence - a.confidence);

  const possiblePlagiarism = (sortedSACReport[0]?.confidence || 0) > 0.8;

  const commits = testResult.context.session
    ? await (
        await fetch(
          siteConfig.benchAPI + `/whose/${testResult.context.session}`,
        )
      ).json()
    : [];

  return (
    <div className="px-8 flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <p className="text-3xl font-bold">提交记录 / {params.id}</p>
        <Chip color={passed ? "success" : "warning"} variant="bordered">
          {passed ? "通过 / Accepted" : "未通过 / Not Accepted"}
        </Chip>
        <OwnerChip session={testResult.context.session} />
      </div>

      {passed ? (
        <p className="text-xl font-bold text-green-300">恭喜！</p>
      ) : (
        <p className="text-xl font-bold text-yellow-300">祝下次好运！</p>
      )}

      <Divider />

      <p className="text-default-500">
        {
          labContents.find((it) => it.id == testResult.context.driver)
            ?.displayName
        }
        <br />
        <br />
        提交于 {new Date(testResult.time).toLocaleString()}
        <br />
        {benchedTime > 0 ? (
          <>评测完成于 {new Date(testResult.time).toLocaleString()}</>
        ) : (
          <>评测失败</>
        )}
        <br />
        指纹：{testResult.context.session}
      </p>

      <Divider className="my-2" />

      <div className="flex mt-2">
        {/* Left column */}
        <div className="flex flex-col basis-2/3 gap-6">
          <p className="text-2xl font-bold">评测总结</p>

          {testResult.error ? (
            <p className="text-warning">{getErrorText(testResult)}</p>
          ) : (
            <div>
              本次评测总计使用了 {totalCount} 个测试点，您的程序通过了&nbsp;
              {passedCount} 个。
              <div className="font-bold gap-4 text-warning pt-4">
                <FailedDescription benchResult={testResult} code="WA" />
                <FailedDescription benchResult={testResult} code="RE" />
                <FailedDescription benchResult={testResult} code="TLE" />
                <FailedDescription benchResult={testResult} code="SE" />
              </div>
            </div>
          )}

          {testResult.assembleExceptions.length > 0 && (
            <>
              <p className="text-2xl font-bold">汇编消息</p>
              <ExceptionList ex={testResult.assembleExceptions} />
            </>
          )}

          <p className="text-2xl font-bold">测试点信息</p>

          <div className="w-10/12">
            <BenchUnits result={testResult} />
          </div>

          <p className="text-2xl font-bold">评测参数</p>
          <div className="w-10/12">
            <CodeBlock
              code={Object.entries(testResult.context.env)
                .map(([k, v]) => k + "=" + v)
                .join("\n")}
            />
          </div>

          <p className="font-bold text-2xl">Sakura Anti-Cheat 检测结果</p>
          <div className="w-10/12 flex flex-col gap-4">
            {possiblePlagiarism && (
              <>
                <p className="text-warning font-bold">
                  SAC 找到了部分重复的记录。
                </p>
                <p className="text-sm">
                  SAC 的检查有时可能会过于严格。谨记：清者自清，浊者自浊。
                </p>
              </>
            )}

            {!passed && (
              <p className="text-default-400 font-bold">
                未通过的评测不在 SAC 的检测范围内。
              </p>
            )}

            {passed && sortedSACReport.length == 0 && (
              <p className="text-default-400 font-bold">
                SAC 没有检测到重复的代码。
              </p>
            )}

            {passed && <SACSummary result={sortedSACReport} />}
          </div>

          {testResult.context.session && (
            <>
              <p className="font-bold text-2xl">
                {testResult.context.session} 的其它提交
              </p>
              <div className="w-10/12 flex flex-col gap-2">
                {commits.map((it: string) => (
                  <Link key={it} color="primary" href={"/r/" + it}>
                    {it}
                  </Link>
                ))}
              </div>
            </>
          )}

          <p className="font-bold text-2xl">测试设备</p>
          <div className="w-10/12 flex flex-col gap-4">
            <CodeBlock code={testResult.runner} />
          </div>

          <p className="font-bold text-2xl">测试环境</p>
          <div className="w-10/12 flex flex-col gap-4">
            {!isLatest && (
              <p className="text-warning font-bold">
                本评测是在一个更早的版本上运行的。如遇问题，可尝试重新评测。
              </p>
            )}
            <CodeBlock code={testResult.runnerVersion} />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col basis-1/3 gap-4">
          <p className="text-2xl font-bold">源代码</p>
          <CopyCode
            data={testResult.context.source}
            session={testResult.context.session}
          />
          <CodeBlock code={testResult.context.source} />
        </div>
      </div>
    </div>
  );
}

function FailedDescription({
  code,
  benchResult,
}: {
  code: string;
  benchResult: TestResult;
}) {
  const count = benchResult.units.filter((u) => u.status === code).length;

  if (count === 0) return <></>;
  switch (code) {
    case "WA":
      return <>{count} 个测试点的答案不正确。</>;
    case "RE":
      return <>{count} 个测试点发生运行错误。</>;
    case "TLE":
      return <>{count} 个测试点运行超时。</>;
    case "SE":
      return <>{count} 个测试点发生参数错误。</>;
    default:
      return <></>;
  }
}

function getErrorText(b: TestResult): string {
  if (b.error === "CE")
    return `未完成评测：汇编错误`; // TODO list compile errors
  else return "未完成评测：评测选项错误或缺失";
}

function getCompletedTime(b: TestResult) {
  let t = -1;

  for (const { time } of b.units) {
    if (time > t) t = time;
  }

  return t;
}
