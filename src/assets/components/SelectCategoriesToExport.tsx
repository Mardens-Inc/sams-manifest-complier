import {Button, Checkbox, CheckboxGroup, cn, Radio, RadioGroup} from "@heroui/react";
import {Manifest} from "../ts/manifest_parser.ts";
import {useCallback, useEffect, useState} from "react";

type SelectCategoriesToExportProps = {
    onSubmit: (categories: string[]) => void;
    manifest: Manifest[];
}

const Templates = {
    CLOTHING: [23, 68, 33, 68, 22],
    ELECTRONICS: [1, 2, 3, 4, 5]
};

type Category = {
    id: number;
    description: string;
}

type CategoryTemplate = "all" | "none" | keyof typeof Templates;

export default function SelectCategoriesToExport(props: SelectCategoriesToExportProps)
{
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState(new Set<Category>());
    const [selectedTemplateRadio, setSelectedTemplateRadio] = useState<CategoryTemplate | undefined>("none" as CategoryTemplate);

    useEffect(() =>
    {
        console.log("Selected categories changed:", Array.from(selectedCategories));
    }, [selectedCategories]);

    useEffect(() =>
    {
        setCategories(() =>
        {
            const categoryMap = new Map<number, Category>();
            props.manifest.forEach(item =>
            {
                categoryMap.set(item.category, {
                    id: item.category,
                    description: item.category_description
                });
            });
            return Array.from(categoryMap.values());
        });
    }, [props.manifest]);

    const handleTemplateSelection = useCallback((template: CategoryTemplate) =>
    {
        setSelectedTemplateRadio(template);
        if (template === "all")
        {
            setSelectedCategories(new Set(categories));
        } else if (template === "none")
        {
            setSelectedCategories(new Set());
        } else if (Templates[template])
        {
            const selectedIds = Templates[template];
            const selected = categories.filter(category => selectedIds.includes(category.id));
            setSelectedCategories(new Set(selected));
        }
    }, [categories, selectedCategories]);

    return (
        <div className={"flex flex-col p-4 gap-4 w-full"} data-tauri-drag-region="">
            <div className={"bg-foreground/5 p-2 rounded mb-4 w-fit"} data-tauri-drag-region="">
                <RadioGroup
                    data-tauri-drag-region=""
                    orientation={"horizontal"}
                    onValueChange={value => handleTemplateSelection(value as CategoryTemplate)}
                    value={selectedTemplateRadio}
                    label={"Select Template"}
                    description={"Automatically select categories based on predefined templates."}
                >
                    {
                        [
                            <Radio key={"all-categories"} value={"all"}>All</Radio>,
                            <Radio key={"no-categories"} value={"none"}>None</Radio>,
                            ...Object.keys(Templates).map((category) => (
                                <Radio key={`category-radio-${category}`} value={category}>
                                    <span className={"capitalize"}>{category.toLowerCase()}</span>
                                </Radio>
                            ))
                        ]
                    }
                </RadioGroup>
            </div>
            <CheckboxGroup
                data-tauri-drag-region=""
                className={"overflow-y-auto"}
                classNames={{
                    base: "flex flex-row gap-2",
                    label: "text-default-700 text-sm"
                }}
                onValueChange={value =>
                {
                    const ids = value.map(i => parseInt(i, 10));
                    const selected = categories.filter(category => ids.includes(category.id));
                    setSelectedCategories(new Set(selected));
                    setSelectedTemplateRadio(undefined);
                }}
                orientation={"horizontal"}
                value={Array.from(selectedCategories).map(c => c.id.toString())}
            >
                {categories.map((category) => (
                    <Checkbox
                        key={`${category.id}`}
                        value={category.id.toString()}
                        classNames={{
                            base: cn(
                                "inline-flex max-w-[235px] w-full bg-content1 m-0",
                                "hover:bg-content2 items-center justify-start",
                                "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                "data-[selected=true]:border-primary"
                            ),
                            label: "w-full"
                        }}
                    >
                        <div className="w-full flex justify-between gap-4 items-center">
                            <span className={"uppercase opacity-50 text-tiny"}>{category.description.toLowerCase()}</span>
                        </div>
                    </Checkbox>
                ))}
            </CheckboxGroup>
            <div
                className={
                    cn(
                        "w-[200px] rounded-full px-4 py-2 gap-2 z-30",
                        "bg-foreground/5 backdrop-blur-sm",
                        "bottom-1 left-1/2 transform -translate-x-1/2",
                        "fixed flex justify-between items-center"
                    )
                }
            >
                <Button radius={"full"} color={"primary"}>Save</Button>
                <Button radius={"full"} color={"danger"} variant={"light"}>Reset</Button>
            </div>
        </div>
    );
}