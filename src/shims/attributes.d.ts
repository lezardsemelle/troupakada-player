import "vue";

declare module "vue" {
	export interface HTMLAttributes {
		"data-bs-toggle"?: "dropdown" | "modal" | "collapse";
		"data-bs-target"?: string;
		"data-bs-dismiss"?: "modal";
	}
}