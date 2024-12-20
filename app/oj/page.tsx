"use client";

import { CodeIcon, ListOrderedIcon, PlayIcon } from "@primer/octicons-react";
import { useState, useEffect } from "react";
import { Select, SelectItem } from "@nextui-org/select";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { toast } from "react-toastify";

import { useCodeEditor } from "@/components/code-editor";
import { labContents } from "@/components/labs";
import { sendBenchRequest } from "@/components/bench";
import { useSession } from "@/components/session";

export default function OJPage() {
  const [code, lang, editor] = useCodeEditor();
  const [labId, setLabId] = useState("hello");
  const [env, setEnv] = useState<Record<string, string>>({});
  const session = useSession();

  useEffect(() => {
    const initLabId = localStorage.getItem("selected-lab") || "hello";

    setLabId(initLabId);
    setEnv(getStoredEnv(initLabId));
  }, []);

  function getStoredEnv(id: string) {
    const e = localStorage.getItem(`env.${id}`);

    if (e) return JSON.parse(e);

    return {};
  }

  const changeLab = (id: string) => {
    setLabId(id);
    setEnv(getStoredEnv(id));
    localStorage.setItem("selected-lab", id);
  };

  const onEnvChange = (id: string, value: string) => {
    const ex = {
      ...env,
      [id]: value,
    };

    setEnv(ex);
    localStorage.setItem(`env.${labId}`, JSON.stringify(ex));
  };

  const runBench = async () => {
    try {
      const res = await sendBenchRequest(session, labId, lang, code, env);

      toast.success("提交成功！");
      location.pathname = "/r/" + res;
    } catch (e) {
      toast.error("提交失败，请再试一次。");
    }
  };

  const currentLab = labContents.find((l) => l.id == labId);
  const envItems = currentLab?.env || [];

  const disableSubmit =
    code.trim().length == 0 ||
    ((currentLab?.env.length || 0) > 0 &&
      (Object.values(env).includes("") || Object.values(env).length == 0));

  return (
    <div className="flex w-full h-full">
      <div className="basis-2/3 flex flex-col gap-4 items-center px-4">
        <div className="flex gap-2 text-xl font-bold items-center">
          <CodeIcon />
          代码编辑
        </div>
        {editor}
      </div>

      <div className="basis-1/3 flex flex-col gap-4 items-center px-4">
        <div className="flex gap-2 text-xl font-bold items-center">
          <ListOrderedIcon />
          评测选项
        </div>

        <Select
          disallowEmptySelection
          label="选取实验"
          selectedKeys={[labId]}
          size="sm"
          onChange={(e) => changeLab(e.target.value)}
        >
          {labContents.map((lab) => (
            <SelectItem key={lab.id}>{lab.displayName}</SelectItem>
          ))}
        </Select>

        <Divider className="my-2" />

        {envItems.map(([qid, qText]) => (
          <Input
            key={labId + "-" + qid}
            errorMessage="此项是必填项"
            isInvalid={!env[qid]}
            label={qText}
            size="sm"
            type="text"
            value={env[qid]}
            onChange={(e) => onEnvChange(qid, e.target.value)}
          />
        ))}

        <Button
          fullWidth
          color="primary"
          isDisabled={disableSubmit}
          size="lg"
          onClick={runBench}
        >
          <div className="flex items-center gap-2">
            <PlayIcon />
            提交代码
          </div>
        </Button>
      </div>
    </div>
  );
}
