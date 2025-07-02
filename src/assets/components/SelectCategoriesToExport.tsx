import {addToast, Button, Checkbox, CheckboxGroup, cn, Radio, RadioGroup} from "@heroui/react";
import {Manifest} from "../ts/manifest_parser.ts";
import {useCallback, useEffect, useState} from "react";

type SelectCategoriesToExportProps = {
    onCancel: () => void;
    manifest: Manifest[];
    onSubmit: (selectedCategories: number[]) => void;
}

const Templates = {
    CLOTHING: [22,23,33,34,68,95],
    HARDGOODS: [12, 16, 94, 8, 66, 3, 21, 2, 53, 7, 10, 9, 11, 5, 6, 47, 18, 4, 31, 89, 61, 13, 88, 29, 17]
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

    const submit = useCallback(() =>
    {
        if (selectedCategories.size === 0)
        {
            addToast({
                title: "No categories selected",
                description: "Please select at least one category to export.",
                color: "danger"
            });
            return;
        }
        props.onSubmit(Array.from(selectedCategories).map(c => c.id));
    }, [selectedCategories]);

    return (
        <div className={"flex flex-col p-4 gap-4 w-full"} data-tauri-drag-region="">
            <div className={"bg-foreground/5 p-2 rounded mb-4"} data-tauri-drag-region="">
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
                <Button radius={"full"} color={"primary"} onPress={submit}>Save</Button>
                <Button radius={"full"} color={"danger"} variant={"light"} onPress={props.onCancel}>Reset</Button>
            </div>
        </div>
    );
}