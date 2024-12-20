"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export default function ViewContractRecentVersions() {
  const params = useParams();
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
type Version = {
  version: number;
  name: string;
  type: string;
  sign_before: number;
  contract_duration: number;
  details: string;
  updated_at: string;
};
  const { data: contractVersions } = trpc.getContractTemplateVersion.useQuery({
    id: params.id as string
  });

  useEffect(() => {
    if (contractVersions?.versions) {
      const sortedVersions = [...(contractVersions.versions as Array<Version>)].sort(
        (a, b) => b.version - a.version
      );
      setVersions(sortedVersions);
      setSelectedVersion(sortedVersions[0]);
    }
  }, [contractVersions]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Contract Template Versions</h1>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="text-green-700 border-green-700 hover:bg-green-50"
        >
          Go Back
        </Button>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Version List */}
        <div className="col-span-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Version History</h2>
            <ScrollArea className="h-[600px]">
              {versions.map((version) => (
                <div key={version.version}>
                  <div
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedVersion?.version === version.version
                        ? "bg-green-50 border-l-4 border-green-500"
                        : "hover:bg-green-50"
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Version {version.version}</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        {new Date(version.updated_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{version.name}</p>
                  </div>
                  <Separator />
                </div>
              ))}
            </ScrollArea>
          </Card>
        </div>

        {/* Version Details */}
        <div className="col-span-8">
          <Card className="p-6">
            {selectedVersion ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-green-700">
                    {selectedVersion.name}
                  </h2>
                  <Badge className="bg-green-500">Version {selectedVersion.version}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Contract Type</p>
                    <p className="text-lg">{selectedVersion.type}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Duration</p>
                    <p className="text-lg">{selectedVersion.contract_duration} years</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Sign Before</p>
                    <p className="text-lg">{selectedVersion.sign_before} weeks</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Last Updated</p>
                    <p className="text-lg">
                      {new Date(selectedVersion.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700 mb-4">
                    Contract Details
                  </h3>
                  <ScrollArea className="h-[300px]">
                    <div className="whitespace-pre-wrap">
                      {JSON.stringify(selectedVersion.details, null, 2)}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Select a version to view details
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
